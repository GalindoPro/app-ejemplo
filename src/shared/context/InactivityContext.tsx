'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useRouter } from 'next/navigation';

interface InactivityContextType {
  isActive: boolean;
  secondsRemaining: number;
  timeoutSeconds: number;
  isWarning: boolean;
  startInactivityTest: (seconds?: number) => void;
  stopInactivityTest: () => void;
  resetTimer: () => void;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);

export const InactivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout, setInactivityNotice, openLoginModal } = useAuth();
  const router = useRouter();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(15);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15);

  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSessionTimeout = useCallback(() => {
    console.warn(`⏳ [Seguridad] Sesión cerrada automáticamente tras ${timeoutSeconds}s de inactividad.`);
    setIsActive(false);
    logout();
    setInactivityNotice(`⚠️ Tu sesión ha sido cerrada automáticamente por ${timeoutSeconds} segundos de inactividad (Política de Seguridad).`);
    router.push('/');
    openLoginModal();
  }, [logout, setInactivityNotice, router, openLoginModal, timeoutSeconds]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);
  }, [timeoutSeconds]);

  const startInactivityTest = (seconds: number = 15) => {
    setTimeoutSeconds(seconds);
    setSecondsRemaining(seconds);
    lastActivityRef.current = Date.now();
    setIsActive(true);
  };

  const stopInactivityTest = () => {
    setIsActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setSecondsRemaining(timeoutSeconds);
  };

  useEffect(() => {
    if (!isActive || !isAuthenticated) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    timerIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSeconds);

      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        handleSessionTimeout();
      }
    }, 1000);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive, isAuthenticated, timeoutSeconds, handleSessionTimeout]);

  return (
    <InactivityContext.Provider
      value={{
        isActive,
        secondsRemaining,
        timeoutSeconds,
        isWarning: isActive && secondsRemaining <= 5 && secondsRemaining > 0,
        startInactivityTest,
        stopInactivityTest,
        resetTimer,
      }}
    >
      {children}
    </InactivityContext.Provider>
  );
};

export const useInactivity = (): InactivityContextType => {
  const context = useContext(InactivityContext);
  if (!context) {
    throw new Error('useInactivity debe ser utilizado dentro de un InactivityProvider');
  }
  return context;
};
