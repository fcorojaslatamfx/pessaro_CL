import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/lib/index';

// Loader optimizado para ProtectedRoute
const AuthLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <div className="relative mb-4">
        <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <Shield className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-muted-foreground">Verificando acceso...</p>
      <p className="text-xs text-muted-foreground mt-1">Pessaro Capital</p>
    </motion.div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string | string[];
  fallbackPath?: string;
  showLoading?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/',
  showLoading = true
}) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading && showLoading) {
    return <AuthLoader />;
  }

  // Si no hay usuario, redirigir al login interno con la ruta actual como parámetro
  if (!user) {
    return <Navigate 
      to={`${ROUTE_PATHS.INTERNAL_LOGIN}?redirect=${encodeURIComponent(location.pathname)}`} 
      replace 
    />;
  }

  // Si se requieren roles específicos, verificar
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-6">
            No tienes permisos suficientes para acceder a esta página.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Tu rol actual: <span className="font-medium capitalize">{user.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Roles requeridos: <span className="font-medium">
                {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido con Suspense
  return (
    <Suspense fallback={<AuthLoader />}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;