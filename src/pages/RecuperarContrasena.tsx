import React, { useState, useEffect, useRef } from 'react';
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Siempre limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // Detectar token de recovery en el hash o query params
  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const queryParams = new URLSearchParams(window.location.search);

    const token = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const type = hashParams.get('type') || queryParams.get('type');

    if (token && type === 'recovery') {
      setAccessToken(token);

      // Establecer sesión y esperar confirmación
      if (refreshToken) {
        supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken
        }).then(({ error }) => {
          if (!error) setSessionReady(true);
          else console.error('Error setting session:', error);
        });
      } else {
        setSessionReady(true);
      }

      setStep('reset');
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Escuchar evento PASSWORD_RECOVERY de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setAccessToken(session.access_token);
        setSessionReady(true);
        setStep('reset');
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePasswordStrength = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Al menos una mayúscula');
    if (!/[a-z]/.test(pwd)) errors.push('Al menos una minúscula');
    if (!/[0-9]/.test(pwd)) errors.push('Al menos un número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('Al menos un carácter especial');
    return { isValid: errors.length === 0, errors };
  };

  const safeSetLoading = (value: boolean) => {
    setIsLoading(value);
    if (value) {
      // Timeout de seguridad: nunca más de 15 segundos cargando
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setError('La operación tardó demasiado. Por favor intente nuevamente.');
      }, 15000);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Formato de correo electrónico inválido.');
      return;
    }

    safeSetLoading(true);
    try {
      // Intentar con Edge Function primero
      const { data, error: fnError } = await supabase.functions.invoke(
        'password_recovery_fixed_2026_02_23_19_30',
        { body: { action: 'request_reset', email: email.toLowerCase().trim() } }
      );

      if (!fnError && data?.success) {
        setMessage('Se ha enviado un enlace de recuperación a su correo. Revise también la carpeta de spam.');
        return;
      }

      // Fallback: Supabase nativo
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        { redirectTo: `${window.location.origin}/recuperar-contrasena` }
      );

      if (authError) throw authError;
      setMessage('Se ha enviado un enlace de recuperación a su correo. Revise también la carpeta de spam.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      safeSetLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const { isValid, errors } = validatePasswordStrength(password);
    if (!isValid) { setError(errors.join(', ')); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }

    safeSetLoading(true);

    try {
      let success = false;

      // Método 1: updateUser con la sesión activa (más directo)
      const updateResult = await Promise.race([
        supabase.auth.updateUser({ password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000)
        )
      ]);

      if ('data' in updateResult && !updateResult.error) {
        success = true;
      } else if ('error' in updateResult && updateResult.error) {
        throw updateResult.error;
      }

      if (!success && accessToken) {
        // Método 2: Edge Function con el token
        const { data, error: fnError } = await supabase.functions.invoke(
          'password_recovery_fixed_2026_02_23_19_30',
          { body: { action: 'update_password', access_token: accessToken, password } }
        );
        if (fnError) throw new Error(fnError.message);
        if (!data?.success) throw new Error(data?.error || 'Error al actualizar contraseña');
        success = true;
      }

      if (success) {
        safeSetLoading(false);
        setStep('success');
        setTimeout(() => navigate(ROUTE_PATHS.SUPER_ADMIN_LOGIN), 3000);
      }
    } catch (err: any) {
      safeSetLoading(false);
      const msg = err.message || '';
      if (msg === 'timeout') {
        setError('La operación tardó demasiado. El enlace puede haber expirado. Solicite uno nuevo.');
      } else if (msg.includes('expired') || msg.includes('invalid')) {
        setError('El enlace de recuperación ha expirado. Por favor solicite uno nuevo.');
      } else {
        setError(msg || 'Error al actualizar la contraseña. Intente solicitar un nuevo enlace.');
      }
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
                  ? 'Su contraseña fue actualizada. Redirigiendo al login...'
                  : step === 'reset'
                  ? 'Ingrese y confirme su nueva contraseña'
                  : 'Ingrese su correo para recibir un enlace de recuperación'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
                    <p className="text-xs text-gray-400">Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos</p>
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

                  {/* Opción para solicitar nuevo enlace si hay problemas */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setStep('request'); setError(''); setPassword(''); setConfirmPassword(''); }}
                      className="text-xs text-gray-400 hover:text-blue-700 underline transition-colors"
                    >
                      ¿Enlace expirado? Solicitar uno nuevo
                    </button>
                  </div>
                </form>
              )}

              {/* Paso 3: Éxito */}
              {step === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <p className="text-gray-600">Será redirigido al login en unos segundos...</p>
                  <Button
                    onClick={() => navigate(ROUTE_PATHS.SUPER_ADMIN_LOGIN)}
                    className="bg-blue-800 hover:bg-blue-900 text-white"
                  >
                    Ir al Login ahora
                  </Button>
                </div>
              )}

              {step !== 'success' && (
                <div className="text-center">
                  <Link
                    to={ROUTE_PATHS.SUPER_ADMIN_LOGIN}
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
