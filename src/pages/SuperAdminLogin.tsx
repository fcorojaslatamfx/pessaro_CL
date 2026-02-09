import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';

const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@pessarocapital.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  
  const { signIn, createSuperAdmin, checkSuperAdminExists, isSuperAdmin, user } = useSuperAdmin();
  const navigate = useNavigate();

  // Verificar si ya existe un super admin
  useEffect(() => {
    const checkExistingAdmin = async () => {
      const result = await checkSuperAdminExists();
      if (result.success && !result.superAdminExists) {
        setShowCreateAdmin(true);
      }
    };
    
    checkExistingAdmin();
  }, []);

  // Redirigir si ya está autenticado como super admin
  useEffect(() => {
    if (isSuperAdmin && user) {
      navigate('/super-admin-panel');
    }
  }, [isSuperAdmin, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        setSuccess('Inicio de sesión exitoso');
        // La redirección se maneja en el useEffect
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperAdmin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await createSuperAdmin();
      
      if (result.success) {
        setSuccess('Super administrador creado exitosamente. Ahora puede iniciar sesión.');
        setShowCreateAdmin(false);
      } else {
        setError(result.error || 'Error al crear super administrador');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Super Administrador
            </CardTitle>
            <p className="text-muted-foreground">
              Acceso restringido - Solo personal autorizado
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mostrar alerta si no existe super admin */}
            {showCreateAdmin && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  No se ha detectado un super administrador. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-800 underline ml-1"
                    onClick={handleCreateSuperAdmin}
                    disabled={loading}
                  >
                    Crear ahora
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Mostrar mensajes de error o éxito */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulario de login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="admin@pessarocapital.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Ingrese su contraseña"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Información de seguridad */}
            <div className="pt-4 border-t border-border">
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>🔒 Conexión segura y cifrada</p>
                <p>📝 Todos los accesos son registrados</p>
                <p>⚠️ Solo para personal autorizado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Pessaro Capital - Sistema de Administración Avanzada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 Todos los derechos reservados
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;