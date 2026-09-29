'use client';

import React from 'react';
import { useInactivityTimer } from '@/shared/hooks/useInactivityTimer';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const InactivityTracker: React.FC<{ timeoutSeconds?: number }> = ({ timeoutSeconds = 15 }) => {
  const { secondsRemaining, isWarning } = useInactivityTimer({ timeoutSeconds });

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isWarning
          ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse ring-2 ring-amber-400/30'
          : 'bg-slate-100/80 border-slate-200 text-slate-700'
      }`}
      title="Temporizador de inactividad de sesión (Seguridad BFF)"
    >
      {isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span className="hidden sm:inline">Inactividad:</span>
      <span className={`font-mono font-bold ${isWarning ? 'text-amber-700' : 'text-slate-900'}`}>
        {secondsRemaining}s
      </span>
      {isWarning && (
        <span className="text-[10px] font-semibold text-amber-600 hidden md:inline">
          ¡Mueve el cursor para no ser desconectado!
        </span>
      )}
    </div>
  );
};
