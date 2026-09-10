import { HttpClient, ApiResponse } from '@/shared/api/httpClient';
import { UserDTO } from '../dtos/user.dto';

interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

interface BackendAuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUser;
  roles: string[];
}

export class AuthService {
  /**
   * Autentica credenciales contra el backend Spring Boot.
   * Retorna UserDTO y almacena el JWT en localStorage.
   */
  static async login(email: string, pass: string): Promise<UserDTO | null> {
    try {
      const response = await HttpClient.post<ApiResponse<BackendAuthResponse>>('/auth/login', {
        email,
        password: pass,
      });

      if (!response.success || !response.data) {
        return null;
      }

      const { token, user, roles } = response.data;

      // Guardar token JWT en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_auth_token', token);
      }

      const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');

      const userDto: UserDTO = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCode: isAdmin ? 'ADMIN' : 'LIMITED',
        isActive: user.isActive,
      };

      return userDto;
    } catch (error) {
      console.error('Error en AuthService.login:', error);
      throw error;
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_auth_token');
      localStorage.removeItem('app_user_session');
    }
  }
}
