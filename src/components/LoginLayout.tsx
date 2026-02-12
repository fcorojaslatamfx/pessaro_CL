import React from 'react';
import { isLoginDomain, isDevelopment } from '@/lib/domains';
import LoginDomainHeader from '@/components/LoginDomainHeader';

interface LoginLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout específico para el dominio de login
 * Se usa cuando estamos en login.pessaro.cl o en rutas administrativas
 */
const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <LoginDomainHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer simple para el dominio de login */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 Pessaro Capital. Portal de Administración.</p>
            <p className="mt-1">Acceso restringido a personal autorizado.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginLayout;