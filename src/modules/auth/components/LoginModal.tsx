'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { X, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, isLoading, loginError, inactivityNotice } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    const success = await login(userEmail, userPass);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={closeLoginModal}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
          zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Acceso al Sistema</h3>
              <p className="text-xs text-slate-500">Ferretería Express</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {inactivityNotice && (
            <div className="flex items-center space-x-2 p-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{inactivityNotice}</span>
            </div>
          )}

          {loginError && (
            <div className="flex items-center space-x-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Perfil rápido:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@empresa.com', 'admin123')}
                className="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg font-medium transition-colors"
              >
                Administrador
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user@empresa.com', 'user123')}
                className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium transition-colors"
              >
                Consulta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
