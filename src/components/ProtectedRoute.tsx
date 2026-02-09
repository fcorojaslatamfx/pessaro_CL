import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/lib/index';

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </motion.div>
      </div>
    );
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

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;