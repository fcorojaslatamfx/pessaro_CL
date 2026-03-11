import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Key, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase } from '@/integrations/supabase/client';

const RecuperarContrasena: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  // Token propio del sistema de recovery (hex 64 chars desde query param ?token=)
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Detectar token de recovery en query params al cargar la página
  useEffect(() => {
    const extractTokenFromUrl = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');

      if (token) {
        setResetToken(token);
        setStep('reset');
        // Limpiar URL para no exponer el token
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // Fallback: detectar token nativo de Supabase en el hash (por si acaso)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.replace('#', ''));
      const accessTokenHash = hashParams.get('access_token');
      const type = hashParams.get('type');
      if (accessTokenHash && type === 'recovery') {
        // Token nativo de Supabase — usar setSession para que updateUser funcione
        const refreshToken = hashParams.get('refresh_token') || '';
        supabase.auth.setSession({ access_token: accessTokenHash, refresh_token: refreshToken })
          .catch(console.error);
        setResetToken('__supabase_native__');
        setStep('reset');
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    extractTokenFromUrl();
  }, []);

  const validatePasswordStrength = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 6) errors.push('Mínimo 6 caracteres');
    return { isValid: errors.length === 0, errors };
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Formato de correo electrónico inválido.');
      return;
    }

    setIsLoading(true);
    try {
      // Usar SOLO la Edge Function personalizada (Resend). Sin fallback a Supabase nativo
      // para evitar enviar doble email al usuario.
      const { data, error: fnError } = await supabase.functions.invoke(
        'password_recovery_fixed_2026_02_23_19_30',
        { body: { action: 'request_reset', email: email.toLowerCase().trim() } }
      );

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || 'Error al enviar el correo');

      setMessage('Se ha enviado un enlace de recuperación a su correo. Revise también la carpeta de spam.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { isValid, errors } = validatePasswordStrength(password);
    if (!isValid) {
      setError(errors.join(', '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!resetToken) {
      setError('Token de recuperación inválido. Por favor solicite un nuevo enlace.');
      return;
    }

    setIsLoading(true);
    try {
      // Llamar SIEMPRE a la Edge Function con el reset_token propio del sistema
      const { data, error: fnError } = await supabase.functions.invoke(
        'password_recovery_fixed_2026_02_23_19_30',
        { body: { action: 'update_password', reset_token: resetToken, password } }
      );

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || 'Error al actualizar contraseña');

      setStep('success');
      setTimeout(() => navigate(ROUTE_PATHS.CMS_LOGIN), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña. El enlace puede haber expirado.');
    } finally {
      setIsLoading(false);
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
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {step === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : step === 'reset' ? (
                  <Key className="w-8 h-8 text-blue-700" />
                ) : (
                  <Shield className="w-8 h-8 text-blue-700" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900">
                {step === 'success' ? '¡Contraseña Actualizada!' : step === 'reset' ? 'Nueva Contraseña' : 'Recuperar Contraseña'}
              </CardTitle>
              <CardDescription className="text-gray-500">
                {step === 'success'
                  ? 'Su contraseña fue actualizada correctamente. Redirigiendo...'
                  : step === 'reset'
                  ? 'Ingrese y confirme su nueva contraseña'
                  : 'Ingrese su correo para recibir un enlace de recuperación'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensajes */}
              {message && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Paso 1: Solicitar reset */}
              {step === 'request' && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="su.email@ejemplo.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      disabled={isLoading}
                      className="h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                    ) : (
                      <><Mail className="mr-2 h-4 w-4" />Enviar Enlace de Recuperación</>
                    )}
                  </Button>
                </form>
              )}

              {/* Paso 2: Nueva contraseña */}
              {step === 'reset' && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ingrese su nueva contraseña"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
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
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirme su nueva contraseña"
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
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
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  {/* Indicadores de validación en tiempo real */}
                  {password && (
                    <div className="text-xs space-y-1">
                      {validatePasswordStrength(password).errors.map((err, i) => (
                        <p key={i} className="text-red-500">• {err}</p>
                      ))}
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-500">• Las contraseñas no coinciden</p>
                      )}
                      {validatePasswordStrength(password).isValid && confirmPassword && password === confirmPassword && (
                        <p className="text-green-600">✓ Contraseña válida</p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-800 hover:bg-blue-900 text-white font-semibold"
                    disabled={
                      isLoading ||
                      !password ||
                      !confirmPassword ||
                      !validatePasswordStrength(password).isValid ||
                      password !== confirmPassword
                    }
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Actualizando...</>
                    ) : (
                      <><Key className="mr-2 h-4 w-4" />Actualizar Contraseña</>
                    )}
                  </Button>
                </form>
              )}

              {/* Paso 3: Éxito */}
              {step === 'success' && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Será redirigido al login en unos segundos...</p>
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.CMS_LOGIN)}
                    className="bg-blue-800 hover:bg-blue-900 text-white"
                  >
                    Ir al Login
                  </Button>
                </div>
              )}

              {/* Navegación */}
              {step !== 'success' && (
                <div className="text-center">
                  <Link
                    to={ROUTE_PATHS.CMS_LOGIN}
                    className="inline-flex items-center text-sm text-gray-400 hover:text-blue-800 transition-colors"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Volver al Login
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-white/70 text-sm">
            ¿Necesita ayuda? Contacte al administrador del sistema
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RecuperarContrasena;
