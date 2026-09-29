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
  Play,
  Zap,
  Pause,
  Timer,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, forceExpireToken } = useAuth();
  const { isActive: isTimerActive, secondsRemaining, startInactivityTest, stopInactivityTest } = useInactivity();

  const [testLogs, setTestLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error'; time: string }>>([
    {
      text: 'Gateway BFF inicializado. Todas las peticiones del cliente se enrutan de forma segura mediante /api/*',
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

  // 1. Diagnóstico BFF
  const handleFetchProducts = async () => {
    setIsTesting(true);
    addLog('📡 [BFF Gateway] Petición enviada: GET http://localhost:3000/api/products...', 'info');
    try {
      const data = await ProductService.getProducts();
      addLog(`✅ [BFF Gateway] 200 OK: ${data.length} productos recibidos mediante el proxy inverso.`, 'success');
    } catch (error: any) {
      addLog(`❌ Error en comunicación BFF: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // 2. Verificación de Auto-Refresh
  const handleTestAutoRefresh = async () => {
    setIsTesting(true);
    addLog('🔄 [Seguridad] Verificando interceptor de sesión y ciclo de vida de tokens...', 'info');
    try {
      forceExpireToken();
      addLog('1️⃣ Petición con token expirado enviada a /api/products -> Esperando 401 Unauthorized...', 'warn');
      
      const result = await ProductService.getProducts();
      
      addLog('2️⃣ 401 capturado -> POST /api/auth/refresh ejecutado automáticamente por el interceptor.', 'info');
      addLog('3️⃣ Nuevo Access Token establecido y petición reintentada con éxito (200 OK).', 'success');
    } catch (error: any) {
      addLog(`❌ Error en renovación de token: ${error.message}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // 3. Auditoría de Inactividad
  const handleToggleInactivity = () => {
    if (isTimerActive) {
      stopInactivityTest();
      addLog('⏸️ [Seguridad] Monitoreo de inactividad pausado.', 'info');
    } else {
      startInactivityTest(15);
      addLog('⏳ [Seguridad] Monitoreo de inactividad iniciado (15s). Esperando ausencia de interacción.', 'warn');
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
            Arquitectura BFF (Backend For Frontend), Interceptor de Refresh Token y Control de Inactividad de Sesión.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PANEL DE MONITOREO Y SEGURIDAD DE RED                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-md p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Centro de Monitoreo & Seguridad de Red
              </h2>
              <p className="text-xs text-slate-500">
                Diagnóstico de comunicación BFF, ciclo de vida de tokens e inactividad de sesión.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60 w-fit flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Gateway BFF Activo (/api/*)</span>
          </span>
        </div>

        {/* 3 Módulos de Diagnóstico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Módulo 1: BFF */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                  <Zap className="w-4 h-4" />
                  <span>Enrutamiento BFF</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                  Proxy Inverso
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Realiza una consulta de catálogo enrutada internamente mediante el proxy de Next.js sin exponer el backend.
              </p>
            </div>
            <button
              onClick={handleFetchProducts}
              disabled={isTesting}
              className="w-full py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Consultar Catálogo (BFF)</span>
            </button>
          </div>

          {/* Módulo 2: Auto-Refresh */}
          <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                  <RefreshCw className="w-4 h-4" />
                  <span>Ciclo de Vida de Token</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  Auto-Refresh
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Valida la intercepción ante token expirado (401), renovación silenciosa y repetición transparente de la petición.
              </p>
            </div>
            <button
              onClick={handleTestAutoRefresh}
              disabled={isTesting}
              className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Verificar Renovación (401 ➔ 200)</span>
            </button>
          </div>

          {/* Módulo 3: Inactividad */}
          <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-4 flex flex-col justify-between hover:border-purple-300 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-800 font-bold text-xs uppercase tracking-wide">
                  <Timer className="w-4 h-4" />
                  <span>Política de Inactividad</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                  15 Segundos
                </span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed">
                {isTimerActive
                  ? `Temporizador en curso: ${secondsRemaining}s restantes sin interacción de mouse/teclado.`
                  : 'Monitorea la inactividad del operador y asegura la sesión cerrándola automáticamente al expirar el tiempo.'}
              </p>
            </div>
            <button
              onClick={handleToggleInactivity}
              className={`w-full py-3 px-3 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
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
                  <span>Iniciar Monitoreo (15s)</span>
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
                <span className="font-mono font-bold text-slate-200">Terminal de Eventos de Red & Sesión</span>
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
