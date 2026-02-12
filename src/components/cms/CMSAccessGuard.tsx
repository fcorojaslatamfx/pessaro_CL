import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib/index';

interface CMSAccessGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function CMSAccessGuard({ children, fallbackPath = '/' }: CMSAccessGuardProps) {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando acceso al CMS...</p>
        </motion.div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login interno
  if (!user) {
    return <Navigate to={ROUTE_PATHS.INTERNAL_LOGIN} replace />;
  }

  // Verificar si el usuario tiene acceso al CMS
  const hasAccess = user.role === 'interno' || user.role === 'admin' || user.role === 'super_admin';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-destructive/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Acceso Restringido</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                El Sistema CMS está disponible únicamente para:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Usuarios Internos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Administradores</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Super Administradores</span>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Tu rol actual: <span className="font-medium text-foreground">{user.role}</span>
                </p>
                <Button 
                  onClick={() => window.location.href = fallbackPath}
                  className="w-full"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Si el usuario tiene acceso, renderizar el contenido
  return <>{children}</>;
}

export default CMSAccessGuard;