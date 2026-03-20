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
  enforceLoginDomainRoutes,
} from '@/lib/domains';

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
        <p className="text-sm text-muted-foreground">Pessaro Capital</p>
      </div>
    </div>
  </div>
);

interface DomainGuardProps {
  children: React.ReactNode;
}

/**
 * DomainGuard — protege rutas según el dominio activo.
 *
 * Lógica:
 *   1. En desarrollo → permite todo.
 *   2. En login.pessaro.cl → solo rutas admin; cualquier otra → /super-admin-login.
 *   3. En pessaro.cl / pessarocapital.com (isMainDomain):
 *        - Ruta de login  → redirige a login.pessaro.cl/<ruta>
 *        - Ruta de main   → renderiza normalmente
 *        - Ruta desconocida → renderiza normalmente (el router/404 la maneja)
 *   4. Dominio desconocido → renderiza normalmente (Vercel ya filtra qué dominios
 *      son válidos; si llega aquí es un dominio previamente autorizado).
 */
const DomainGuard: React.FC<DomainGuardProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Forzar rutas válidas en login.pessaro.cl
  useEffect(() => {
    if (!isDevelopment()) {
      enforceLoginDomainRoutes(currentPath);
    }
  }, [currentPath]);

  // ── Desarrollo: sin restricciones ─────────────────────────────────────
  if (isDevelopment()) {
    return <Suspense fallback={<DomainLoader />}>{children}</Suspense>;
  }

  const isCurrentlyOnMain  = isMainDomain();
  const isCurrentlyOnLogin = isLoginDomain();
  const shouldBeOnLogin    = isLoginRoute(currentPath);
  const shouldBeOnMain     = isMainRoute(currentPath);
  const forceLogin         = shouldForceLoginDomain();

  // ── login.pessaro.cl: solo rutas admin ────────────────────────────────
  if (forceLogin && !shouldBeOnLogin) {
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
    return <DomainLoader />;
  }

  // ── pessaro.cl / pessarocapital.com: redirigir rutas admin al subdominio
  if (isCurrentlyOnMain && shouldBeOnLogin) {
    window.location.href = getLoginDomainUrl(currentPath);
    return <DomainLoader />;
  }

  // ── login.pessaro.cl: redirigir rutas main al dominio principal ────────
  if (isCurrentlyOnLogin && shouldBeOnMain) {
    window.location.href = getMainDomainUrl(currentPath);
    return <DomainLoader />;
  }

  // ── login.pessaro.cl: ruta ni main ni login → super-admin-login ────────
  if (isCurrentlyOnLogin && !shouldBeOnLogin) {
    return <Navigate to="/super-admin-login" replace />;
  }

  // ── Dominio principal: ruta desconocida → dejar pasar (router la maneja) ─
  // NO redirigir a "/" — el catch-all de App.tsx mostrará la página de error
  // correctamente. Redirigir aquí rompería rutas dinámicas como /blog/:slug.

  return <Suspense fallback={<DomainLoader />}>{children}</Suspense>;
};

export default DomainGuard;
