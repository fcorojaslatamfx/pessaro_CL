import { supabase } from '@/integrations/supabase/client';
import { getLoginDomainUrl } from '@/lib/domains';

/**
 * Servicio para manejo de reset de contraseñas
 * Funciona para Super Admin, Personal Interno y Clientes
 */

export interface ResetPasswordResult {
  success: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

/**
 * Función para validar si un email existe en alguna de las tablas de usuarios
 */
const validateUserEmail = async (email: string): Promise<{ exists: boolean; userType: string | null }> => {
  try {
    // 1. Verificar en user_profiles (tabla principal)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, email, is_active')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileData && !profileError) {
      // Verificar si el usuario está activo
      if (profileData.is_active === false) {
        return { exists: false, userType: null }; // Usuario desactivado
      }

      // Determinar el tipo de usuario basado en roles
      const { data: roleData } = await supabase
        .from('user_roles_2026_02_08_22_02')
        .select('role')
        .eq('user_id', profileData.user_id)
        .single();

      if (roleData) {
        switch (roleData.role) {
          case 'super_admin':
            return { exists: true, userType: 'Super Administrador' };
          case 'admin':
          case 'interno':
            return { exists: true, userType: 'Personal Interno' };
          case 'cliente':
            return { exists: true, userType: 'Cliente' };
          default:
            return { exists: true, userType: 'Usuario' };
        }
      }
      
      return { exists: true, userType: 'Usuario' };
    }

    // 2. Si no está en user_profiles, asumir que el usuario podría existir en auth
    // Supabase manejará la validación del email en resetPasswordForEmail
    // Por ahora, permitir el intento de reset para cualquier email válido
    return { exists: true, userType: 'Usuario' };

    return { exists: false, userType: null };
  } catch (error) {
    console.error('Error validating user email:', error);
    return { exists: false, userType: null };
  }
};

/**
 * Función principal para reset de contraseña
 */
export const resetPassword = async (email: string): Promise<ResetPasswordResult> => {
  try {
    // Validaciones básicas
    if (!email || !email.trim()) {
      return {
        success: false,
        message: '❌ El email es obligatorio.',
        type: 'error'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: '❌ Formato de email inválido.',
        type: 'error'
      };
    }

    // Validar si el usuario existe en nuestras tablas
    const { exists, userType } = await validateUserEmail(email);
    
    if (!exists) {
      return {
        success: false,
        message: '❌ Usuario no encontrado. Verifique el email ingresado.',
        type: 'error'
      };
    }

    // Configurar la URL de redirección
    const redirectUrl = getLoginDomainUrl('/recuperar-contrasena');

    // Enviar email de reset usando Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: redirectUrl
    });

    if (error) {
      console.error('Reset password error:', error);
      
      // Manejar errores específicos
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          message: '⏱️ Demasiados intentos. Espere 60 segundos antes de intentar nuevamente.',
          type: 'warning'
        };
      }
      
      if (error.message.includes('not found')) {
        return {
          success: false,
          message: '❌ Usuario no encontrado en el sistema de autenticación.',
          type: 'error'
        };
      }

      return {
        success: false,
        message: `❌ Error al enviar el correo: ${error.message}`,
        type: 'error'
      };
    }

    return {
      success: true,
      message: `✅ Correo enviado con éxito. Revise su bandeja de entrada para restablecer su contraseña.${userType ? ` (${userType})` : ''}`,
      type: 'success'
    };

  } catch (error) {
    console.error('Unexpected error in resetPassword:', error);
    return {
      success: false,
      message: '❌ Error inesperado. Intente nuevamente más tarde.',
      type: 'error'
    };
  }
};

/**
 * Función para verificar si estamos en el flujo de reset (URL contiene reset=true)
 */
export const isResetPasswordFlow = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('reset') === 'true';
};

/**
 * Función para limpiar los parámetros de reset de la URL
 */
export const clearResetParams = (): void => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete('reset');
  window.history.replaceState({}, '', url.toString());
};