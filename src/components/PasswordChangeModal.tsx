import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Key,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface PasswordChangeModalProps {
  userId: string;
  userEmail: string;
  onPasswordChanged: () => void;
  onCancel: () => void;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  score: number;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  userId,
  userEmail,
  onPasswordChanged,
  onCancel
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calcular fortaleza de la contraseña
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    const hasMinLength = password.length >= 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      score
    };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const isPasswordValid = passwordStrength.score === 5;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Débil';
    if (score <= 3) return 'Regular';
    if (score <= 4) return 'Buena';
    return 'Excelente';
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.functions.invoke('super_admin_complete_2026_02_10', {
        body: {
          action: 'update_password',
          userId: userId,
          newPassword: newPassword
        }
      });

      if (error) {
        setError(`Error actualizando contraseña: ${error.message}`);
        return;
      }

      if (!data.success) {
        setError(data.error || 'Error desconocido al actualizar contraseña');
        return;
      }

      setSuccess(data.message || 'Contraseña actualizada exitosamente');
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onPasswordChanged();
      }, 2000);

    } catch (err: any) {
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Cambio de Contraseña Obligatorio
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Por seguridad, debe cambiar su contraseña temporal antes de continuar
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              Usuario: {userEmail}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alerta informativa */}
            <Alert className="border-orange-200 bg-orange-50">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Esta es su primera vez iniciando sesión. Por seguridad, debe establecer una nueva contraseña.
              </AlertDescription>
            </Alert>

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

            {/* Formulario de cambio de contraseña */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  Nueva Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Ingrese su nueva contraseña"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>

                  {/* Requisitos de contraseña */}
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-2 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Al menos 10 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Una letra mayúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Una letra minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.hasNumbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Un número
                    </div>
                    <div className={`flex items-center gap-2 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordStrength.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      Un carácter especial (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Nueva Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Confirme su nueva contraseña"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Indicador de coincidencia */}
                {confirmPassword && (
                  <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                >
                  {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </form>

            {/* Información de seguridad */}
            <div className="pt-4 border-t border-border">
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>🔒 Su nueva contraseña será cifrada y almacenada de forma segura</p>
                <p>📝 Este cambio será registrado en los logs de seguridad</p>
                <p>⚠️ No podrá continuar sin cambiar la contraseña</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PasswordChangeModal;