import React, { useEffect } from 'react';
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

interface DomainGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas según el dominio
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

  // En desarrollo, permitir todas las rutas
  if (isDevelopment()) {
    return <>{children}</>;
  }

  const isCurrentlyOnMain = isMainDomain();
  const isCurrentlyOnLogin = isLoginDomain();
  const shouldBeOnLogin = isLoginRoute(currentPath);
  const shouldBeOnMain = isMainRoute(currentPath);
  const forceLoginDomain = shouldForceLoginDomain();

  // Lógica estricta: si estamos en login.pessaro.cl, solo permitir rutas administrativas
  if (forceLoginDomain && !shouldBeOnLogin) {
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirigiendo...</h2>
          <p className="text-muted-foreground">
            Redirigiendo al portal de administración...
          </p>
        </div>
      </div>
    );
  }

  // Si estamos en el dominio principal pero la ruta debe estar en login
  if (isCurrentlyOnMain && shouldBeOnLogin) {
    // Redirigir al dominio de login
    window.location.href = getLoginDomainUrl(currentPath);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirigiendo...</h2>
          <p className="text-muted-foreground">
            Redirigiendo al portal de administración...
          </p>
        </div>
      </div>
    );
  }

  // Si estamos en el dominio de login pero la ruta debe estar en main
  if (isCurrentlyOnLogin && shouldBeOnMain) {
    // Redirigir al dominio principal
    window.location.href = getMainDomainUrl(currentPath);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirigiendo...</h2>
          <p className="text-muted-foreground">
            Redirigiendo al sitio principal...
          </p>
        </div>
      </div>
    );
  }

  // Si estamos en el dominio de login pero la ruta no es válida para login
  if (isCurrentlyOnLogin && !shouldBeOnLogin) {
    return <Navigate to="/super-admin-login" replace />;
  }

  // Si estamos en el dominio principal pero la ruta no es válida para main
  if (isCurrentlyOnMain && !shouldBeOnMain && !shouldBeOnLogin) {
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderizar los children
  return <>{children}</>;
};

export default DomainGuard;