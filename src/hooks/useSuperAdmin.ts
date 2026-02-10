import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ConfidentialContent {
  id: string;
  title: string;
  content_type: string;
  file_path: string;
  description: string;
  classification_level: string;
  created_at: string;
}

// Función para obtener mensajes de error específicos y útiles
const getAuthErrorMessage = (errorMessage: string): string => {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('invalid login credentials') || message.includes('credenciales incorrectas')) {
    return '❌ Credenciales incorrectas. Verifique su email y contraseña de super administrador.';
  }
  
  if (message.includes('email not confirmed') || message.includes('email no confirmado')) {
    return '⚠️ Email no confirmado. Verifique su bandeja de entrada y confirme su cuenta.';
  }
  
  if (message.includes('too many requests') || message.includes('demasiados intentos')) {
    return '🚫 Demasiados intentos de acceso. Espere 15 minutos antes de intentar nuevamente.';
  }
  
  if (message.includes('user not found') || message.includes('usuario no encontrado')) {
    return '❌ Usuario no encontrado. Verifique que el email de super admin sea correcto.';
  }
  
  if (message.includes('invalid email') || message.includes('email inválido')) {
    return '❌ Formato de email inválido. Ingrese un email válido.';
  }
  
  if (message.includes('password should be at least') || message.includes('contraseña debe tener')) {
    return '❌ La contraseña debe tener al menos 6 caracteres.';
  }
  
  if (message.includes('signup not allowed') || message.includes('registro no permitido')) {
    return '🚫 Registro no permitido. Contacte al administrador del sistema.';
  }
  
  if (message.includes('database') || message.includes('base de datos')) {
    return '🔧 Error de conexión a la base de datos. Intente nuevamente en unos momentos.';
  }
  
  if (message.includes('network') || message.includes('conexión') || message.includes('connection')) {
    return '🌐 Error de conexión de red. Verifique su conexión a internet.';
  }
  
  if (message.includes('timeout') || message.includes('tiempo agotado')) {
    return '⏱️ Tiempo de espera agotado. El servidor tardó demasiado en responder.';
  }
  
  if (message.includes('unauthorized') || message.includes('no autorizado') || message.includes('acceso denegado')) {
    return '🔒 Acceso denegado. Este panel es exclusivo para super administradores.';
  }
  
  if (message.includes('forbidden') || message.includes('prohibido')) {
    return '🚫 Operación no permitida. Verifique sus permisos de acceso.';
  }
  
  // Mensaje genérico mejorado
  return `⚠️ Error de autenticación: ${errorMessage}`;
};

export const useSuperAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Verificar sesión y rol del usuario
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Obtener rol del usuario
          const { data: roleData, error } = await supabase
            .from('user_roles_2026_02_08_22_02')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!error && roleData) {
            setUserRole(roleData);
            setIsSuperAdmin(roleData.role === 'super_admin');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          checkUserRole();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole(null);
          setIsSuperAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Función para iniciar sesión con validaciones y mensajes mejorados
  const signIn = async (email: string, password: string) => {
    try {
      // Validaciones previas
      if (!email.trim()) {
        return { success: false, error: '❌ El email es obligatorio.' };
      }
      
      if (!password.trim()) {
        return { success: false, error: '❌ La contraseña es obligatoria.' };
      }

      if (!email.includes('@')) {
        return { success: false, error: '❌ Formato de email inválido.' };
      }

      if (password.length < 6) {
        return { success: false, error: '❌ La contraseña debe tener al menos 6 caracteres.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: getAuthErrorMessage(error.message) };
      }

      if (!data.user) {
        return { success: false, error: '❌ Error inesperado: No se pudo obtener información del usuario.' };
      }

      // Verificar si el usuario tiene rol de super admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles_2026_02_08_22_02')
        .select('role, permissions')
        .eq('user_id', data.user.id)
        .single();

      if (roleError) {
        await supabase.auth.signOut(); // Cerrar sesión si hay error
        return { 
          success: false, 
          error: '🚫 Usuario no autorizado. Este acceso es exclusivo para super administradores.' 
        };
      }

      if (!roleData || roleData.role !== 'super_admin') {
        await supabase.auth.signOut(); // Cerrar sesión si no es super admin
        return { 
          success: false, 
          error: '🔒 Acceso denegado. Se requieren permisos de super administrador para acceder a este panel.' 
        };
      }

      // Verificar si el usuario está activo (si existe la tabla user_profiles)
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('is_active, full_name')
        .eq('user_id', data.user.id)
        .single();

      if (profileData && profileData.is_active === false) {
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: '⛔ Cuenta desactivada. Contacte al administrador del sistema.' 
        };
      }

      // Registrar acceso exitoso en logs
      await logAccess(data.user.id, 'SUPER_ADMIN_LOGIN', 'authentication');

      return { 
        success: true, 
        user: data.user,
        message: `✅ Bienvenido, ${profileData?.full_name || 'Super Administrador'}`
      };

    } catch (error: any) {
      console.error('Super admin login error:', error);
      return { 
        success: false, 
        error: getAuthErrorMessage(error.message || 'Error inesperado. Contacte al administrador del sistema.') 
      };
    }
  };

  // Función para cerrar sesión con mensajes mejorados
  const signOut = async () => {
    try {
      if (user) {
        await logAccess(user.id, 'SUPER_ADMIN_LOGOUT', 'authentication');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: `❌ Error al cerrar sesión: ${error.message}` };
      }

      setUser(null);
      setUserRole(null);
      setIsSuperAdmin(false);
      
      return { success: true, message: '✅ Sesión cerrada correctamente' };
    } catch (error: any) {
      return { success: false, error: `⚠️ Error inesperado: ${error.message}` };
    }
  };

  // Función para crear super administrador con validaciones mejoradas
  const createSuperAdmin = async (email?: string, password?: string, forceRecreate = false) => {
    try {
      const adminEmail = email || 'admin@pessarocapital.com';
      const adminPassword = password || '@PessaroAdmin2026!';

      // Validaciones previas
      if (!adminEmail.includes('@')) {
        return { success: false, error: '❌ Formato de email inválido.' };
      }

      if (adminPassword.length < 8) {
        return { success: false, error: '❌ La contraseña debe tener al menos 8 caracteres.' };
      }

      const { data, error } = await supabase.functions.invoke('super_admin_complete_2026_02_10', {
        body: {
          action: 'force_create',
          email: adminEmail,
          password: adminPassword,
          forceRecreate: forceRecreate
        }
      });

      if (error) {
        return { success: false, error: `❌ Error creando super admin: ${error.message}` };
      }

      if (!data.success) {
        return { success: false, error: getAuthErrorMessage(data.error || 'Error desconocido al crear super administrador') };
      }

      return { 
        success: true, 
        message: '✅ Super administrador creado exitosamente. Ya puede iniciar sesión.',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `⚠️ Error inesperado: ${error.message || 'Contacte al soporte técnico'}` 
      };
    }
  };

  // Función para actualizar contraseña con validaciones
  const updatePassword = async (userId: string, newPassword: string) => {
    try {
      if (newPassword.length < 8) {
        return { success: false, error: '❌ La nueva contraseña debe tener al menos 8 caracteres.' };
      }

      const { data, error } = await supabase.functions.invoke('super_admin_complete_2026_02_10', {
        body: {
          action: 'update_password',
          userId,
          newPassword
        }
      });

      if (error) {
        return { success: false, error: `❌ Error actualizando contraseña: ${error.message}` };
      }

      if (!data.success) {
        return { success: false, error: getAuthErrorMessage(data.error || 'Error desconocido al actualizar contraseña') };
      }

      return { success: true, message: '✅ Contraseña actualizada correctamente' };
    } catch (error: any) {
      return { 
        success: false, 
        error: `⚠️ Error inesperado: ${error.message || 'Contacte al soporte técnico'}` 
      };
    }
  };

  // Función para obtener contenido confidencial con manejo de errores mejorado
  const getConfidentialContent = async (): Promise<ConfidentialContent[]> => {
    if (!isSuperAdmin) {
      throw new Error('🔒 Acceso denegado: Se requieren permisos de super administrador');
    }

    try {
      // Registrar acceso a contenido confidencial
      if (user) {
        await logAccess(user.id, 'VIEW_CONFIDENTIAL_CONTENT', 'confidential_content');
      }

      const { data, error } = await supabase
        .from('confidential_content_2026_02_08_22_02')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`❌ Error cargando contenido confidencial: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching confidential content:', error);
      throw new Error(`⚠️ Error inesperado: ${error.message}`);
    }
  };

  // Función para obtener logs de acceso con manejo de errores mejorado
  const getAccessLogs = async (limit: number = 100) => {
    if (!isSuperAdmin) {
      throw new Error('🔒 Acceso denegado: Se requieren permisos de super administrador');
    }

    try {
      const { data, error } = await supabase
        .from('access_logs_2026_02_08_22_02')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`❌ Error cargando logs de acceso: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching access logs:', error);
      throw new Error(`⚠️ Error inesperado: ${error.message}`);
    }
  };

  // Función para registrar accesos con información adicional
  const logAccess = async (
    userId: string, 
    action: string, 
    resourceType?: string, 
    resourceId?: string
  ) => {
    try {
      await supabase
        .from('access_logs_2026_02_08_22_02')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          ip_address: null, // Se puede agregar si es necesario
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging access:', error);
      // No lanzar error aquí para no interrumpir el flujo principal
    }
  };

  // Función para verificar si existe super admin con manejo de errores mejorado
  const checkSuperAdminExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('super_admin_complete_2026_02_10', {
        method: 'GET'
      });

      if (error) {
        return { 
          success: false, 
          error: `❌ Error verificando super admin: ${error.message}` 
        };
      }

      return data;
    } catch (error: any) {
      return { 
        success: false, 
        error: `⚠️ Error inesperado: ${error.message || 'No se pudo verificar el estado del super administrador'}` 
      };
    }
  };

  return {
    user,
    userRole,
    loading,
    isSuperAdmin,
    signIn,
    signOut,
    createSuperAdmin,
    updatePassword,
    getConfidentialContent,
    getAccessLogs,
    logAccess,
    checkSuperAdminExists
  };
};