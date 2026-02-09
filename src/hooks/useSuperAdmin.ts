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

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Registrar acceso en logs
      if (data.user) {
        await logAccess(data.user.id, 'LOGIN', 'authentication');
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      if (user) {
        await logAccess(user.id, 'LOGOUT', 'authentication');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserRole(null);
      setIsSuperAdmin(false);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Función para crear super administrador
  const createSuperAdmin = async (email?: string, password?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create_super_admin_2026_02_08_22_02', {
        body: {
          action: 'create_super_admin',
          email: email || 'admin@pessarocapital.com',
          password: password || '@pessaro2026'
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Función para actualizar contraseña
  const updatePassword = async (userId: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create_super_admin_2026_02_08_22_02', {
        body: {
          action: 'update_password',
          userId,
          newPassword
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Función para obtener contenido confidencial
  const getConfidentialContent = async (): Promise<ConfidentialContent[]> => {
    if (!isSuperAdmin) {
      throw new Error('Acceso denegado: Se requieren permisos de super administrador');
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

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching confidential content:', error);
      throw error;
    }
  };

  // Función para obtener logs de acceso
  const getAccessLogs = async (limit: number = 100) => {
    if (!isSuperAdmin) {
      throw new Error('Acceso denegado: Se requieren permisos de super administrador');
    }

    try {
      const { data, error } = await supabase
        .from('access_logs_2026_02_08_22_02')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  };

  // Función para registrar accesos
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
          resource_id: resourceId
        });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  };

  // Función para verificar si existe super admin
  const checkSuperAdminExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create_super_admin_2026_02_08_22_02', {
        method: 'GET'
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
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