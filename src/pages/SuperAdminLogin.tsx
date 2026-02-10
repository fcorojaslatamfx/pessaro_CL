import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Wifi, 
  WifiOff,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import { supabase } from '@/integrations/supabase/client';

// Función para mejorar los mensajes de error con contexto específico
const getImprovedErrorMessage = (errorMessage: string): { message: string; type: 'error' | 'warning' | 'info' } => {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('invalid login credentials') || message.includes('credenciales incorrectas')) {
    return {
      message: '❌ Credenciales incorrectas. Verifique su email y contraseña de super administrador.',
      type: 'error'
    };
  }
  
  if (message.includes('email not confirmed') || message.includes('email no confirmado')) {
    return {
      message: '⚠️ Email no confirmado. Verifique su bandeja de entrada y confirme su cuenta.',
      type: 'warning'
    };
  }
  
  if (message.includes('too many requests') || message.includes('demasiados intentos')) {
    return {
      message: '🚫 Demasiados intentos de acceso. Espere 15 minutos antes de intentar nuevamente.',
      type: 'error'
    };
  }
  
  if (message.includes('user not found') || message.includes('usuario no encontrado')) {
    return {
      message: '❌ Usuario no encontrado. Verifique que el email de super admin sea correcto.',
      type: 'error'
    };
  }
  
  if (message.includes('network') || message.includes('conexión') || message.includes('connection')) {
    return {
      message: '🌐 Error de conexión. Verifique su conexión a internet e intente nuevamente.',
      type: 'warning'
    };
  }
  
  if (message.includes('database') || message.includes('base de datos')) {
    return {
      message: '🔧 Error de base de datos. El sistema está experimentando problemas técnicos.',
      type: 'error'
    };
  }
  
  if (message.includes('unauthorized') || message.includes('no autorizado') || message.includes('acceso denegado')) {
    return {
      message: '🔒 Acceso denegado. Este panel es exclusivo para super administradores.',
      type: 'error'
    };
  }
  
  if (message.includes('timeout') || message.includes('tiempo agotado')) {
    return {
      message: '⏱️ Tiempo de espera agotado. El servidor tardó demasiado en responder.',
      type: 'warning'
    };
  }
  
  if (message.includes('cuenta desactivada') || message.includes('account disabled')) {
    return {
      message: '⛔ Cuenta desactivada. Contacte al administrador del sistema.',
      type: 'error'
    };
  }
  
  // Mensaje genérico mejorado
  return {
    message: errorMessage.startsWith('❌') || errorMessage.startsWith('⚠️') || errorMessage.startsWith('🔒') 
      ? errorMessage 
      : `⚠️ ${errorMessage}`,
    type: 'error'
  };
};

const SuperAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@pessarocapital.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string>('');
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  
  const { signIn, createSuperAdmin, checkSuperAdminExists, isSuperAdmin, user } = useSuperAdmin();
  const navigate = useNavigate();

  // Verificar conexión a internet
  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Verificar si ya existe un super admin
  useEffect(() => {
    const checkExistingAdmin = async () => {
      if (connectionStatus === 'online') {
        try {
          const result = await checkSuperAdminExists();
          if (result.success && !result.superAdminExists) {
            setShowCreateAdmin(true);
          }
        } catch (error) {
          console.error('Error checking super admin:', error);
        }
      }
    };
    
    checkExistingAdmin();
  }, [connectionStatus, checkSuperAdminExists]);

  // Redirigir si ya está autenticado como super admin
  useEffect(() => {
    if (isSuperAdmin && user) {
      navigate('/super-admin-panel');
    }
  }, [isSuperAdmin, user, navigate]);

  // Resetear intentos después de 15 minutos
  useEffect(() => {
    if (loginAttempts >= 5) {
      const timer = setTimeout(() => {
        setLoginAttempts(0);
        setError('');
      }, 15 * 60 * 1000); // 15 minutos

      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar conexión
    if (connectionStatus === 'offline') {
      setError('🌐 Sin conexión a internet. Verifique su conexión y vuelva a intentar.');
      return;
    }
    
    // Validaciones previas
    if (!email.trim()) {
      setError('❌ El email es obligatorio.');
      return;
    }
    
    if (!password.trim()) {
      setError('❌ La contraseña es obligatoria.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('❌ Formato de email inválido.');
      return;
    }
    
    if (password.length < 6) {
      setError('❌ La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    // Verificar límite de intentos y tiempo
    const now = Date.now();
    if (loginAttempts >= 5) {
      const timeLeft = Math.ceil((15 * 60 * 1000 - (now - lastAttemptTime)) / 1000 / 60);
      if (timeLeft > 0) {
        setError(`🚫 Demasiados intentos fallidos. Espere ${timeLeft} minutos antes de intentar nuevamente.`);
        return;
      } else {
        setLoginAttempts(0); // Resetear si ya pasó el tiempo
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        setSuccess(result.message || '✅ Inicio de sesión exitoso.');
        setLoginAttempts(0); // Resetear intentos en caso de éxito
        
        // Verificar si requiere cambio de contraseña
        if (result.user) {
          try {
            const { data: checkData, error: checkError } = await supabase.functions.invoke('super_admin_complete_2026_02_10', {
              body: {
                action: 'check_first_login',
                userId: result.user.id
              }
            });
            
            if (!checkError && checkData.success && checkData.requiresPasswordChange) {
              setLoggedInUserId(result.user.id);
              setRequiresPasswordChange(true);
              setShowPasswordChangeModal(true);
              return; // No redirigir aún
            }
          } catch (checkErr) {
            console.error('Error checking first login:', checkErr);
          }
        }
        
        // Si no requiere cambio de contraseña, redirigir normalmente
        setTimeout(() => {
          navigate('/super-admin-panel');
        }, 1500);
      } else {
        const improvedError = getImprovedErrorMessage(result.error || 'Error desconocido');
        setError(improvedError.message);
        setLoginAttempts(prev => prev + 1);
        setLastAttemptTime(now);
      }
    } catch (err: any) {
      const improvedError = getImprovedErrorMessage(err.message || 'Error inesperado');
      setError(improvedError.message);
      setLoginAttempts(prev => prev + 1);
      setLastAttemptTime(now);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuperAdmin = async () => {
    if (connectionStatus === 'offline') {
      setError('🌐 Sin conexión a internet. Verifique su conexión y vuelva a intentar.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await createSuperAdmin();
      
      if (result.success) {
        setSuccess(result.message || '✅ Super administrador creado exitosamente. Ya puede iniciar sesión con las credenciales por defecto.');
        setShowCreateAdmin(false);
        setPassword('@pessaro2026'); // Autocompletar contraseña por defecto
      } else {
        const improvedError = getImprovedErrorMessage(result.error || 'Error desconocido');
        setError(improvedError.message);
      }
    } catch (err: any) {
      const improvedError = getImprovedErrorMessage(err.message || 'Error inesperado');
      setError(improvedError.message);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = () => {
    if (loginAttempts < 5) return 0;
    const elapsed = Date.now() - lastAttemptTime;
    const remaining = Math.max(0, 15 * 60 * 1000 - elapsed);
    return Math.ceil(remaining / 1000 / 60);
  };

  const isBlocked = loginAttempts >= 5 && getRemainingTime() > 0;

  // Funciones para manejar el modal de cambio de contraseña
  const handlePasswordChanged = () => {
    setShowPasswordChangeModal(false);
    setRequiresPasswordChange(false);
    setSuccess('✅ Contraseña actualizada exitosamente. Redirigiendo al panel...');
    
    setTimeout(() => {
      navigate('/super-admin-panel');
    }, 2000);
  };

  const handleCancelPasswordChange = () => {
    // No permitir cancelar el cambio de contraseña obligatorio
    // El usuario debe cambiar la contraseña para continuar
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
            
            {/* Indicador de conexión */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {connectionStatus === 'online' ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Conectado</span>
                </>
              ) : connectionStatus === 'offline' ? (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600">Sin conexión</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Verificando conexión...</span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mostrar alerta si no existe super admin */}
            {showCreateAdmin && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-2">
                    <p>No se ha detectado un super administrador en el sistema.</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                      onClick={handleCreateSuperAdmin}
                      disabled={loading || connectionStatus === 'offline'}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando...
                        </div>
                      ) : (
                        '🔧 Crear Super Administrador'
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Mostrar alerta de intentos fallidos */}
            {loginAttempts >= 3 && loginAttempts < 5 && (
              <Alert className="border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  ⚠️ {5 - loginAttempts} intentos restantes antes del bloqueo temporal.
                </AlertDescription>
              </Alert>
            )}

            {/* Mostrar alerta de bloqueo */}
            {isBlocked && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  🚫 Cuenta bloqueada temporalmente. Tiempo restante: {getRemainingTime()} minutos.
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
                  Email de Super Administrador
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
                    disabled={loading || connectionStatus === 'offline' || isBlocked}
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
                    disabled={loading || connectionStatus === 'offline' || isBlocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || connectionStatus === 'offline' || isBlocked}
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
                disabled={loading || connectionStatus === 'offline' || isBlocked}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando credenciales...
                  </div>
                ) : connectionStatus === 'offline' ? (
                  '🌐 Sin conexión'
                ) : isBlocked ? (
                  `🚫 Bloqueado (${getRemainingTime()}min)`
                ) : (
                  '🔐 Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Información de seguridad */}
            <div className="pt-4 border-t border-border">
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>🔒 Conexión segura y cifrada</p>
                <p>📝 Todos los accesos son registrados</p>
                <p>⚠️ Solo para personal autorizado</p>
                {loginAttempts > 0 && (
                  <p className="text-orange-600">
                    🚨 Intentos fallidos: {loginAttempts}/5
                  </p>
                )}
              </div>
            </div>

            {/* Credenciales por defecto (solo mostrar si se creó admin) */}
            {showCreateAdmin && (
              <div className="pt-4 border-t border-border">
                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">📋 Credenciales por defecto:</p>
                  <p>Email: admin@pessarocapital.com</p>
                  <p>Contraseña: @pessaro2026</p>
                  <p className="text-orange-600">⚠️ Cambie la contraseña después del primer acceso</p>
                </div>
              </div>
            )}
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
      
      {/* Modal de cambio de contraseña obligatorio */}
      {showPasswordChangeModal && (
        <PasswordChangeModal
          userId={loggedInUserId}
          userEmail={email}
          onPasswordChanged={handlePasswordChanged}
          onCancel={handleCancelPasswordChange}
        />
      )}
    </div>
  );
};

export default SuperAdminLogin;