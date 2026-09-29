'use client';

import React from 'react';
import { useInactivity } from '@/shared/context/InactivityContext';
import { Clock, AlertTriangle, Play, Pause } from 'lucide-react';

export const InactivityTracker: React.FC = () => {
  const { isActive, secondsRemaining, isWarning, startInactivityTest, stopInactivityTest } = useInactivity();

  if (!isActive) {
    return (
      <button
        onClick={() => startInactivityTest(15)}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-700 transition-all cursor-pointer"
        title="Haz clic para activar la prueba de inactividad de 15 segundos"
      >
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>Inactividad:</span>
        <span className="font-semibold text-slate-500">En Espera</span>
        <Play className="w-3 h-3 text-indigo-600 fill-indigo-600 ml-0.5" />
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isWarning
          ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse ring-2 ring-amber-400/30'
          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
      }`}
      title="Temporizador de inactividad activo (15s)"
    >
      {isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
      )}
      <span>Inactividad:</span>
      <span className={`font-mono font-bold ${isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>
        {secondsRemaining}s
      </span>
      <button
        onClick={stopInactivityTest}
        className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
        title="Pausar prueba"
      >
        <Pause className="w-3 h-3" />
      </button>
    </div>
  );
};
