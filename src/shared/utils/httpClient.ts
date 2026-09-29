/**
 * Cliente HTTP con Interceptor de Autenticación y Renovación Automática de Tokens (BFF Pattern)
 */

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

type RefreshSubscriber = (newToken: string) => void;

class HttpClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: RefreshSubscriber[] = [];
  private onSessionExpiredCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
  }

  public loadTokensFromStorage(): void {
    if (typeof window === 'undefined') return;
    this.accessToken = localStorage.getItem('app_access_token');
    this.refreshToken = localStorage.getItem('app_refresh_token');
  }

  public setTokens(tokens: TokenPair): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_access_token', tokens.accessToken);
      localStorage.setItem('app_refresh_token', tokens.refreshToken);
    }
  }

  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_access_token');
      localStorage.removeItem('app_refresh_token');
    }
  }

  public getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('app_access_token');
    }
    return this.accessToken;
  }

  public getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('app_refresh_token');
    }
    return this.refreshToken;
  }

  public onSessionExpired(callback: () => void): void {
    this.onSessionExpiredCallback = callback;
  }

  /**
   * Helper para simular un token expirado manualmente (para demostración de video)
   */
  public forceExpireAccessToken(): void {
    const expiredPayload = {
      userId: 'usr_01',
      email: 'admin@empresa.com',
      roleCode: 'ADMIN',
      fullName: 'Carlos Administración',
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) - 60, // Expirado hace 1 minuto
    };
    const b64 = (s: string) => btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = b64(JSON.stringify(expiredPayload));
    const fakeExpiredToken = `${header}.${body}.expired_sig_${Date.now()}`;
    
    this.accessToken = fakeExpiredToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_access_token', fakeExpiredToken);
    }
  }

  private onTokenRefreshed(newToken: string): void {
    this.refreshSubscribers.forEach((callback) => callback(newToken));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: RefreshSubscriber): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Solicita silenciosamente un nuevo token al servidor BFF (/api/auth/refresh)
   */
  private async refreshAccessToken(): Promise<string | null> {
    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.clearTokens();
      if (this.onSessionExpiredCallback) this.onSessionExpiredCallback();
      return null;
    }

    try {
      console.log('🔄 [BFF Interceptor] Detectado 401 Unauthorized. Solicitando nuevo token a /api/auth/refresh...');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        console.warn('❌ [BFF Interceptor] Falló la renovación del token. Sesión expirada.');
        this.clearTokens();
        if (this.onSessionExpiredCallback) this.onSessionExpiredCallback();
        return null;
      }

      const data = await response.json();
      console.log('✅ [BFF Interceptor] Token renovado exitosamente por el BFF.');
      
      this.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data.accessToken;
    } catch (error) {
      console.error('❌ [BFF Interceptor] Error de red durante la renovación del token:', error);
      this.clearTokens();
      if (this.onSessionExpiredCallback) this.onSessionExpiredCallback();
      return null;
    }
  }

  /**
   * Petición HTTP centralizada con Interceptor de 401 y reintento transparente
   */
  public async request<T = any>(
    url: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<T> {
    const headers = new Headers(options.headers || {});

    // Adjuntar cabecera Authorization si no existe y tenemos token
    const token = this.getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    // Interceptor: Manejo de 401 Unauthorized
    if (response.status === 401 && !isRetry) {
      console.warn(`⚠️ [BFF Interceptor] Petición a ${url} rechazada con 401 Unauthorized.`);

      if (!this.isRefreshing) {
        this.isRefreshing = true;

        const newToken = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (newToken) {
          this.onTokenRefreshed(newToken);
          console.log(`🔁 [BFF Interceptor] Reintentando petición original a ${url} con nuevo token...`);
          // Reintentar la llamada original
          return this.request<T>(url, options, true);
        } else {
          throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
        }
      }

      // Si ya hay una renovación en curso, encolar la petición hasta que termine
      return new Promise<T>((resolve, reject) => {
        this.addRefreshSubscriber(async (newToken: string) => {
          try {
            console.log(`🔁 [BFF Interceptor] Reintentando petición encolada a ${url}...`);
            const retryResponse = await this.request<T>(url, options, true);
            resolve(retryResponse);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP Error ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    return response.json();
  }

  public get<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public post<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(url: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
