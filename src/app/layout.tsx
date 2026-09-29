import type { Metadata } from 'next';
import { AuthProvider } from '@/modules/auth/context/AuthContext';
import { InactivityProvider } from '@/shared/context/InactivityContext';
import { LoginModal } from '@/modules/auth/components/LoginModal';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ferretería Express - Herramientas & Materiales',
  description: 'Aplicación web para gestión integral de ferretería',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <AuthProvider>
          <InactivityProvider>
            {children}
            <LoginModal />
          </InactivityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
