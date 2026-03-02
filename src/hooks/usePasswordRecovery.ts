import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PasswordResetRequest {
  action: 'request_reset' | 'verify_reset' | 'update_password' | 'validate_token';
  email?: string;
  password?: string;
  access_token?: string;
  refresh_token?: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const usePasswordRecovery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const clearMessages = () => {
    setError('');
    setMessage('');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    clearMessages();

    try {
      const { data, error } = await supabase.functions.invoke('password_recovery_fixed_2026_02_23_19_30', {
        body: {
          action: 'request_reset',
          email: email.toLowerCase().trim()
        } as PasswordResetRequest
      });

      if (error) {
        throw new Error(error.message || 'Error al solicitar recuperación de contraseña');
      }

      const response: PasswordResetResponse = data;

      if (!response.success) {
        throw new Error(response.error || 'Error desconocido');
      }

      setMessage(response.message);
      return true;

    } catch (err: any) {
      console.error('Error requesting password reset:', err);
      setError(err.message || 'Error al solicitar recuperación de contraseña');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateResetToken = async (accessToken: string): Promise<{ valid: boolean; userData?: any }> => {
    setIsLoading(true);
    clearMessages();

    try {
      const { data, error } = await supabase.functions.invoke('password_recovery_fixed_2026_02_23_19_30', {
        body: {
          action: 'validate_token',
          access_token: accessToken
        } as PasswordResetRequest
      });

      if (error) {
        throw new Error(error.message || 'Error al validar token');
      }

      const response: PasswordResetResponse = data;

      if (!response.success) {
        setError(response.error || 'Token inválido o expirado');
        return { valid: false };
      }

      return { valid: true, userData: response.data };

    } catch (err: any) {
      console.error('Error validating token:', err);
      setError(err.message || 'Error al validar token');
      return { valid: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (accessToken: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    clearMessages();

    try {
      // Validar contraseña en el frontend también
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos');
      }

      const { data, error } = await supabase.functions.invoke('password_recovery_fixed_2026_02_23_19_30', {
        body: {
          action: 'update_password',
          access_token: accessToken,
          password: newPassword
        } as PasswordResetRequest
      });

      if (error) {
        throw new Error(error.message || 'Error al actualizar contraseña');
      }

      const response: PasswordResetResponse = data;

      if (!response.success) {
        throw new Error(response.error || 'Error desconocido');
      }

      setMessage(response.message);
      return true;

    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Error al actualizar contraseña');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string, redirectUrl?: string): Promise<boolean> => {
    setIsLoading(true);
    clearMessages();

    try {
      // Usar el método nativo de Supabase como fallback
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || `${window.location.origin}/recuperar-contrasena`
      });

      if (error) {
        throw error;
      }

      setMessage('Se ha enviado un enlace de recuperación a su correo electrónico.');
      return true;

    } catch (err: any) {
      console.error('Error with native reset:', err);
      setError(err.message || 'Error al enviar correo de recuperación');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    isLoading,
    error,
    message,
    clearMessages,
    requestPasswordReset,
    validateResetToken,
    updatePassword,
    resetPasswordForEmail,
    validatePasswordStrength,
    validateEmail
  };
};