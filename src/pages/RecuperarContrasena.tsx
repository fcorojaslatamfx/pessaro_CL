import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordRecovery } from '@/hooks/usePasswordRecovery';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const RecuperarContrasena: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Usar el hook de recuperación de contraseña
  const {
    isLoading,
    error,
    message,
    clearMessages,
    requestPasswordReset,
    updatePassword,
    validatePasswordStrength,
    validateEmail
  } = usePasswordRecovery();

  // Verificar si hay tokens de reset en la URL
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      setStep('reset');
      // Establecer la sesión con los tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores al escribir
    if (error) clearMessages();
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validaciones
    if (!formData.email) {
      return;
    }

    if (!validateEmail(formData.email)) {
      return;
    }

    const success = await requestPasswordReset(formData.email);
    if (success) {
      // Limpiar formulario
      setFormData(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validar contraseñas
    if (!formData.password || !formData.confirmPassword) {
      return;
    }

    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Obtener el token de acceso de la URL
    const accessToken = searchParams.get('access_token');
    if (!accessToken) {
      return;
    }

    const success = await updatePassword(accessToken, formData.password);
    if (success) {
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(ROUTE_PATHS.SUPER_ADMIN_LOGIN);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                {step === 'request' ? (
                  <Mail className="w-8 h-8 text-accent" />
                ) : (
                  <Key className="w-8 h-8 text-accent" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                {step === 'request' ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {step === 'request' 
                  ? 'Ingrese su correo electrónico para recibir un enlace de recuperación'
                  : 'Ingrese su nueva contraseña'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensajes de estado */}
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Formulario de solicitud de reset */}
              {step === 'request' && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="su.email@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="h-12"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    disabled={isLoading || !formData.email || !validateEmail(formData.email)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Enlace de Recuperación
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Formulario de reset de contraseña */}
              {step === 'reset' && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ingrese su nueva contraseña"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-12 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, incluya mayúsculas, minúsculas, números y símbolos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirme su nueva contraseña"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-12 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Validación de contraseña en tiempo real */}
                  {formData.password && (
                    <div className="text-xs space-y-1">
                      {validatePasswordStrength(formData.password).errors.map((error, index) => (
                        <p key={index} className="text-red-500">• {error}</p>
                      ))}
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500">• Las contraseñas no coinciden</p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    disabled={
                      isLoading || 
                      !formData.password || 
                      !formData.confirmPassword ||
                      !validatePasswordStrength(formData.password).isValid ||
                      formData.password !== formData.confirmPassword
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Actualizar Contraseña
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Enlaces de navegación */}
              <div className="text-center space-y-2">
                <Link
                  to={ROUTE_PATHS.SUPER_ADMIN_LOGIN}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver al Login
                </Link>
                
                {step === 'request' && (
                  <p className="text-xs text-muted-foreground">
                    ¿Recordó su contraseña?{' '}
                    <Link to={ROUTE_PATHS.SUPER_ADMIN_LOGIN} className="text-accent hover:underline">
                      Iniciar Sesión
                    </Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-white/80 text-sm">
            ¿Necesita ayuda? Contacte al administrador del sistema
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;