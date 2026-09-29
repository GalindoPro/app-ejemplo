'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserModel } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { UserAdapter } from '../adapters/user.adapter';
import { httpClient } from '@/shared/utils/httpClient';

interface AuthContextType {
  user: UserModel | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  isLoading: boolean;
  loginError: string | null;
  inactivityNotice: string | null;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setInactivityNotice: (msg: string | null) => void;
  forceExpireToken: () => void;
  testRefreshFlow: (force401?: boolean) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);

  const logout = useCallback(() => {
    const rToken = httpClient.getRefreshToken();
    AuthService.logout(rToken);
    httpClient.clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_user_session');
    }
  }, []);

  useEffect(() => {
    // Restaurar sesión activa desde localStorage en el primer render del cliente
    if (typeof window !== 'undefined') {
      httpClient.loadTokensFromStorage();
      const savedUser = localStorage.getItem('app_user_session');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('app_user_session');
        }
      }

      // Registrar callback cuando la sesión expire definitivamente
      httpClient.onSessionExpired(() => {
        logout();
        setInactivityNotice('Tu sesión ha expirado o el Refresh Token es inválido.');
        setIsLoginModalOpen(true);
      });
    }
  }, [logout]);

  const openLoginModal = () => {
    setLoginError(null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginError(null);
    setInactivityNotice(null);
    setIsLoginModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);
    setInactivityNotice(null);

    try {
      // 1. Llamada a través del BFF (/api/auth/login)
      const authResult = await AuthService.login(email, pass);

      if (!authResult || !authResult.success) {
        setLoginError('Credenciales inválidas o usuario inactivo.');
        setIsLoading(false);
        return false;
      }

      // 2. Guardar Tokens (Access + Refresh)
      httpClient.setTokens({
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
      });

      // 3. Adaptar DTO -> Model
      const userModel = UserAdapter.toModel(authResult.user);
      setUser(userModel);

      if (typeof window !== 'undefined') {
        localStorage.setItem('app_user_session', JSON.stringify(userModel));
      }

      setIsLoginModalOpen(false);
      setIsLoading(false);
      return true;
    } catch {
      setLoginError('Ocurrió un error al procesar el inicio de sesión.');
      setIsLoading(false);
      return false;
    }
  };

  const forceExpireToken = () => {
    httpClient.forceExpireAccessToken();
  };

  const testRefreshFlow = async (force401: boolean = false) => {
    return await AuthService.testProtectedEndpoint(force401);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoginModalOpen,
        isLoading,
        loginError,
        inactivityNotice,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        setInactivityNotice,
        forceExpireToken,
        testRefreshFlow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
