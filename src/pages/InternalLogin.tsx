import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Shield,
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/lib/index';
import { resetPassword, ResetPasswordResult } from '@/services/passwordReset';

interface InternalLoginProps {
  redirectTo?: string;
}

interface InternalLoginProps {
  redirectTo?: string;
}

const InternalLogin: React.FC<InternalLoginProps> = ({ redirectTo }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { signIn, loading, error, user } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || redirectTo || ROUTE_PATHS.INTERNAL_DASHBOARD;
      navigate(redirect);
    }
  }, [user, navigate, searchParams, redirectTo]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await signIn(formData.email, formData.password);

    if (result.success) {
      // Redirigir al dashboard o a la página especificada
      const redirect = searchParams.get('redirect') || redirectTo || ROUTE_PATHS.INTERNAL_DASHBOARD;
      navigate(redirect);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Funciones para reset de contraseña
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(formData.email); // Pre-llenar con el email actual
    setResetMessage(null);
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetMessage({ text: '❌ El email es obligatorio.', type: 'error' });
      return;
    }

    setResetLoading(true);
    setResetMessage(null);

    try {
      const result: ResetPasswordResult = await resetPassword(resetEmail);
      
      setResetMessage({
        text: result.message,
        type: result.type
      });

      if (result.success) {
        // Cerrar el modal después de 3 segundos si fue exitoso
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setResetMessage(null);
        }, 3000);
      }
    } catch (error) {
      setResetMessage({
        text: '❌ Error inesperado. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleCancelReset = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Acceso Interno</h1>
            <p className="text-muted-foreground">
              Ingrese sus credenciales para acceder al dashboard
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@pessaro.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Error general */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    'Iniciando sesión...'
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
              
              {/* Enlace de olvidó contraseña */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 underline transition-colors"
                  disabled={loading || resetLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </div>

          {/* Security Notice */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Acceso Restringido</h4>
                  <p className="text-xs text-muted-foreground">
                    Este dashboard está restringido a personal interno autorizado y clientes registrados. 
                    Todas las actividades son monitoreadas y registradas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Modal de reset de contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-foreground">
                  Restablecer Contraseña
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Ingrese su email para recibir un enlace de restablecimiento
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Mensaje de estado */}
                {resetMessage && (
                  <div className={`p-3 rounded-lg border ${
                    resetMessage.type === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : resetMessage.type === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      {resetMessage.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : resetMessage.type === 'warning' ? (
                        <Info className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <p className={`text-sm ${
                        resetMessage.type === 'success' 
                          ? 'text-green-800' 
                          : resetMessage.type === 'warning'
                          ? 'text-yellow-800'
                          : 'text-red-800'
                      }`}>
                        {resetMessage.text}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Campo de email */}
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="usuario@pessarocapital.com"
                      className="pl-10"
                      disabled={resetLoading}
                    />
                  </div>
                </div>
                
                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelReset}
                    disabled={resetLoading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading || !resetEmail.trim()}
                    className="flex-1"
                  >
                    {resetLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Enlace'
                    )}
                  </Button>
                </div>
                
                {/* Información adicional */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <p>📬 El enlace será enviado a su correo electrónico</p>
                  <p>🔗 Redirigirá a login.pessaro.cl</p>
                  <p>⏱️ Válido por 1 hora</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InternalLogin;