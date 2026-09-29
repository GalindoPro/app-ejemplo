'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UseInactivityTimerProps {
  timeoutSeconds?: number;
  enabled?: boolean;
}

export function useInactivityTimer({
  timeoutSeconds = 15,
  enabled = true,
}: UseInactivityTimerProps = {}) {
  const { isAuthenticated, logout, setInactivityNotice, openLoginModal } = useAuth();
  const router = useRouter();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);
    setIsIdle(false);
  }, [timeoutSeconds]);

  // Manejador del cierre de sesión por inactividad
  const handleSessionTimeout = useCallback(() => {
    console.warn(`⏳ [Seguridad] Sesión cerrada automáticamente tras ${timeoutSeconds}s de inactividad.`);
    setIsIdle(true);
    logout();
    setInactivityNotice(`⚠️ Tu sesión ha sido cerrada automáticamente por ${timeoutSeconds} segundos de inactividad (Política de Seguridad).`);
    router.push('/');
    openLoginModal();
  }, [logout, setInactivityNotice, router, openLoginModal, timeoutSeconds]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    // Inicializar timestamp
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);

    // Lista de eventos de interacción global
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Registrar listeners pasivos para máximo rendimiento
    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    // Intervalo de conteo regresivo cada 1 segundo
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
  }, [enabled, isAuthenticated, timeoutSeconds, handleSessionTimeout]);

  return {
    secondsRemaining,
    isWarning: secondsRemaining <= 5 && secondsRemaining > 0,
    isIdle,
    resetTimer,
  };
}
