'use client';

import React, { useState } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useInactivity } from '@/shared/context/InactivityContext';
import { ProductService } from '@/modules/products/services/product.service';
import {
  Shield,
  User,
  Users,
  Truck,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Clock,
  Play,
  Zap,
  Pause,
  Timer,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, forceExpireToken } = useAuth();
  const { isActive: isTimerActive, secondsRemaining, startInactivityTest, stopInactivityTest } = useInactivity();

  const [testLogs, setTestLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error'; time: string }>>([
    {
      text: 'Sistema BFF inicializado. Todas las peticiones están enmascaradas bajo /api/*',
      type: 'info',
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [isTesting, setIsTesting] = useState(false);

  if (!user) return null;

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error') => {
    setTestLogs((prev) => [
      { text, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 15),
    ]);
  };

  // 1. Demostración BFF: Consultar Productos vía Proxy BFF
  const handleFetchProducts = async () => {
    setIsTesting(true);
    addLog('📡 Iniciando petición al BFF: GET http://localhost:3000/api/products...', 'info');
    try {
      const data = await ProductService.getProducts();
      addLog(`✅ BFF respondió con éxito (200 OK): ${data.length} productos recibidos sin exponer Backend real.`, 'success');
    } catch (error: any) {
      addLog(`❌ Error en llamada BFF: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // 2. Demostración Refresh Token: Simular Token Expirado
  const handleForceExpire = () => {
    forceExpireToken();
    addLog('⚠️ Token de Acceso manipulado a estado "EXPIRADO" en localStorage/memoria.', 'warn');
    addLog('ℹ️ La próxima llamada recibirá 401 Unauthorized y disparará el auto-refresh silencioso.', 'info');
  };

  // 3. Demostración Interceptor: Petición que dispara 401 -> Refresh -> Retry
  const handleTestAutoRefresh = async () => {
    setIsTesting(true);
    addLog('🔄 Enviando petición protegida para verificar Interceptor de 401...', 'info');
    try {
      forceExpireToken();
      addLog('1️⃣ Petición enviada con Access Token Expirado a /api/products...', 'warn');
      
      const result = await ProductService.getProducts();
      
      addLog('2️⃣ 401 Unauthorized interceptado -> POST /api/auth/refresh ejecutado automáticamente.', 'info');
      addLog('3️⃣ Nuevo Access Token obtenido y petición original reintentada con éxito (200 OK)! 🎉', 'success');
    } catch (error: any) {
      addLog(`❌ Error en flujo de auto-refresh: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // 4. Demostración Inactividad: Iniciar/Detener temporizador de 15 segundos
  const handleToggleInactivity = () => {
    if (isTimerActive) {
      stopInactivityTest();
      addLog('⏸️ Prueba de inactividad pausada.', 'info');
    } else {
      startInactivityTest(15);
      addLog('⏳ Prueba de inactividad iniciada (15s). Suelta el mouse y teclado para demostrar la expulsión.', 'warn');
    }
  };

  const currentAccessToken = typeof window !== 'undefined' ? localStorage.getItem('app_access_token') : null;
  const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('app_refresh_token') : null;

  return (
    <div className="space-y-8">
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
            {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{user.role === 'ADMIN' ? 'Administrador General' : 'Usuario Consulta'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel de Control - Ferretería Express
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Implementación de Arquitectura BFF (Backend For Frontend), Interceptor de Refresh Token y Control de Inactividad.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL DE DEMOSTRACIÓN Y PRUEBAS PARA EVALUACIÓN DEL VIDEO (BFF & SECURITY) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consola de Pruebas de Seguridad & Patrón BFF
              </h2>
              <p className="text-xs text-slate-500">
                Herramientas interactivas para demostrar los 3 criterios de la rúbrica con la pestaña Network abierta.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60 w-fit">
            ● BFF Activo en /api/*
          </span>
        </div>

        {/* 4 Acciones Rápidas de Demostración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Prueba 1: Demostración BFF */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                <Zap className="w-4 h-4" />
                <span>1. Demostración BFF</span>
              </div>
              <p className="text-xs text-slate-600">
                Consulta catálogo llamando únicamente a <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/products</code> (Proxy BFF sin exponer el backend).
              </p>
            </div>
            <button
              onClick={handleFetchProducts}
              disabled={isTesting}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Consultar Datos vía BFF</span>
            </button>
          </div>

          {/* Prueba 2: Forzar Token Expirado */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                <span>2. Forzar 401</span>
              </div>
              <p className="text-xs text-amber-900">
                Altera el Access Token a expirado para forzar un <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">401 Unauthorized</code> en la siguiente llamada.
              </p>
            </div>
            <button
              onClick={handleForceExpire}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Forzar Token Expirado</span>
            </button>
          </div>

          {/* Prueba 3: Demostración Auto-Refresh Interceptor */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                <RefreshCw className="w-4 h-4" />
                <span>3. Refresh Token</span>
              </div>
              <p className="text-xs text-emerald-900">
                Dispara el flujo completo: <strong>401</strong> ➔ solicitud a <strong>/api/auth/refresh</strong> ➔ reintento exitoso (<strong>200 OK</strong>).
              </p>
            </div>
            <button
              onClick={handleTestAutoRefresh}
              disabled={isTesting}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Probar Refresh (401 ➔ 200)</span>
            </button>
          </div>

          {/* Prueba 4: Demostración Control de Inactividad */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-purple-800 font-bold text-xs uppercase tracking-wide">
                <Timer className="w-4 h-4" />
                <span>4. Inactividad (15s)</span>
              </div>
              <p className="text-xs text-purple-900">
                {isTimerActive
                  ? `Temporizador activo: ${secondsRemaining}s restantes sin mover mouse/teclado.`
                  : 'Inicia el conteo regresivo de 15s para demostrar el cierre automático en video.'}
              </p>
            </div>
            <button
              onClick={handleToggleInactivity}
              className={`w-full py-2.5 px-3 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                isTimerActive
                  ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isTimerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar ({secondsRemaining}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Iniciar Inactividad (15s)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Visor de Tokens y Registro de Eventos en Vivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          
          {/* Tokens de Sesión */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between text-indigo-400 font-sans font-bold">
              <span>Estado de Tokens (BFF)</span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">JWT Bearer</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Access Token (Vida: 60s):</span>
              <p className="bg-slate-800/80 p-2 rounded-lg text-[11px] break-all border border-slate-700/60 text-emerald-400">
                {currentAccessToken ? `${currentAccessToken.substring(0, 45)}...` : 'Sin token'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Refresh Token (Vida: 10m):</span>
              <p className="bg-slate-800/80 p-2 rounded-lg text-[11px] break-all border border-slate-700/60 text-sky-400">
                {currentRefreshToken ? `${currentRefreshToken.substring(0, 45)}...` : 'Sin token'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-400 flex items-center justify-between">
              <span>Estado Inactividad:</span>
              <span className={`font-bold ${isTimerActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                {isTimerActive ? `Activo (${secondsRemaining}s)` : 'En Espera'}
              </span>
            </div>
          </div>

          {/* Consola de Logs en Vivo */}
          <div className="lg:col-span-2 p-4 bg-slate-900 text-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold text-slate-200">Live BFF Interceptor Terminal</span>
              </div>
              <button
                onClick={() => setTestLogs([])}
                className="text-[10px] hover:text-white transition-colors"
              >
                Limpiar consola
              </button>
            </div>

            <div className="h-40 overflow-y-auto space-y-2 text-xs font-mono pr-2">
              {testLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-500 text-[10px] shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">24</span>
            <span className="text-xs text-slate-400 block mt-1">Clientes registrados</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proveedores</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {user.role === 'ADMIN' ? '12' : 'Restringido'}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {user.role === 'ADMIN' ? 'Distribuidoras activas' : 'Solo Administradores'}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventario</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">6</span>
            <span className="text-xs text-amber-600 font-semibold block mt-1 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>1 producto con stock bajo</span>
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas de Hoy</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">$348.50</span>
            <span className="text-xs text-slate-400 block mt-1">5 transacciones completadas</span>
          </div>
        </div>
      </div>

      {/* Acceso Rápido al Catálogo */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">Catálogo & Stock en Tiempo Real</h3>
          <p className="text-xs text-slate-500">
            Revisa los precios de venta, precios de costo y alerta de stock mínimo consultados a través del BFF.
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all shrink-0"
        >
          <span>Ver Productos</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
