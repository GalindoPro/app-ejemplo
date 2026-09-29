import { UserDTO } from '../dtos/user.dto';
import { httpClient } from '@/shared/utils/httpClient';

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * Realiza la autenticación mediante el Proxy BFF (/api/auth/login)
   */
  static async login(email: string, pass: string): Promise<AuthLoginResponse | null> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!response.ok) {
        return null;
      }

      const data: AuthLoginResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error en AuthService.login (BFF):', error);
      return null;
    }
  }

  /**
   * Cierra la sesión en el BFF (/api/auth/logout)
   */
  static async logout(refreshToken?: string | null): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Error en AuthService.logout (BFF):', error);
    }
  }

  /**
   * Ejecuta una petición de prueba para verificar interceptor 401 y refresh
   */
  static async testProtectedEndpoint(forceExpire: boolean = false): Promise<any> {
    const url = forceExpire ? '/api/test-401?force=true' : '/api/test-401';
    return await httpClient.get(url);
  }
}
