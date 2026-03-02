import React, { useEffect, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  isMainDomain, 
  isLoginDomain, 
  isLoginRoute, 
  isMainRoute, 
  isDevelopment,
  getMainDomainUrl,
  getLoginDomainUrl,
  shouldForceLoginDomain,
  enforceLoginDomainRoutes
} from '@/lib/domains';

// Loader optimizado para DomainGuard
const DomainLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Verificando dominio...
        </h2>
        <p className="text-sm text-muted-foreground">
          Pessaro Capital
        </p>
      </div>
    </div>
  </div>
);

interface DomainGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas según el dominio
 * Optimizado para trabajar con lazy loading y Suspense
 * Bloquea el acceso a rutas que no corresponden al dominio actual
 */
const DomainGuard: React.FC<DomainGuardProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Aplicar lógica estricta para el dominio de login
  useEffect(() => {
    // Solo en producción
    if (!isDevelopment()) {
      enforceLoginDomainRoutes(currentPath);
    }
  }, [currentPath]);

  // En desarrollo, permitir todas las rutas con Suspense
  if (isDevelopment()) {
    return (
      <Suspense fallback={<DomainLoader />}>
        {children}
      </Suspense>
    );
  }

  const isCurrentlyOnMain = isMainDomain();
  const isCurrentlyOnLogin = isLoginDomain();
  const shouldBeOnLogin = isLoginRoute(currentPath);
  const shouldBeOnMain = isMainRoute(currentPath);
  const forceLoginDomain = shouldForceLoginDomain();

  // Lógica estricta: si estamos en login.pessaro.cl, solo permitir rutas administrativas
  if (forceLoginDomain && !shouldBeOnLogin) {
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
    return <DomainLoader />;
  }

  // Si estamos en el dominio principal pero la ruta debe estar en login
  if (isCurrentlyOnMain && shouldBeOnLogin) {
    // Redirigir al dominio de login
    window.location.href = getLoginDomainUrl(currentPath);
    return <DomainLoader />;
  }

  // Si estamos en el dominio de login pero la ruta debe estar en main
  if (isCurrentlyOnLogin && shouldBeOnMain) {
    // Redirigir al dominio principal
    window.location.href = getMainDomainUrl(currentPath);
    return <DomainLoader />;
  }

  // Si estamos en el dominio de login pero la ruta no es válida para login
  if (isCurrentlyOnLogin && !shouldBeOnLogin) {
    return <Navigate to="/super-admin-login" replace />;
  }

  // Si estamos en el dominio principal pero la ruta no es válida para main
  if (isCurrentlyOnMain && !shouldBeOnMain && !shouldBeOnLogin) {
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderizar los children con Suspense
  return (
    <Suspense fallback={<DomainLoader />}>
      {children}
    </Suspense>
  );
};

export default DomainGuard;