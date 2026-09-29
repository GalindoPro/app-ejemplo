'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/AuthContext';
import {
  Wrench,
  LayoutDashboard,
  Users,
  Truck,
  Package,
  LogOut,
  Shield,
  User,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { InactivityTracker } from '@/shared/components/InactivityTracker';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full w-fit mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Acceso Restringido</h2>
          <p className="text-xs text-slate-500">Inicia sesión para ingresar al sistema.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LIMITED'] },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users, roles: ['ADMIN', 'LIMITED'] },
    { name: 'Proveedores', href: '/dashboard/suppliers', icon: Truck, roles: ['ADMIN'] },
    { name: 'Inventario', href: '/dashboard/products', icon: Package, roles: ['ADMIN', 'LIMITED'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Lateral */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0">
        
        <div className="p-6 space-y-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Ferretería</span>
              <span className="text-base font-bold text-indigo-600 tracking-tight">Express</span>
            </div>
          </Link>

          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Gestión
            </div>
            {menuItems.map((item) => {
              const isAllowed = item.roles.includes(user.role);
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (!isAllowed) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center justify-between px-3 py-2.5 text-xs text-slate-300 rounded-xl cursor-not-allowed"
                    title="Acceso no disponible para este perfil"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    <Lock className="w-3 h-3 text-slate-300" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                user.role === 'ADMIN'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {user.role === 'ADMIN' ? 'Administrador' : 'Consulta'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center justify-center space-x-2 w-full py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 capitalize">
              {pathname.replace('/dashboard', '').replace('/', '') || 'Resumen General'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <InactivityTracker timeoutSeconds={15} />
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1">{children}</main>
      </div>

    </div>
  );
}
