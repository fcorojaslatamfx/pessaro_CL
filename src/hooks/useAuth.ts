import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'cliente' | 'interno' | 'admin' | 'super_admin';
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  profile?: any;
  fullName?: string;
  department?: string;
  isActive?: boolean;
  lastLogin?: string;
  permissions?: Record<string, any>;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUserWithRole(session.user, true); // true = redirigir tras login
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        await loadUserWithRole(authUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setError('Error verificando autenticación');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role: string) => {
    const currentPath = window.location.pathname;
    if (role === 'cliente') {
      // Clientes siempre van al dashboard del portal cliente
      navigate('/portal-cliente/dashboard', { replace: true });
    } else if (['super_admin', 'admin', 'interno'].includes(role)) {
      // Staff: si ya está en una ruta /cms/* no redirigir (ya está en el lugar correcto)
      // Si viene del login, ir al dashboard
      if (currentPath === '/cms/login' || currentPath === '/cms/login/') {
        navigate('/cms/dashboard', { replace: true });
      }
      // Si está en otra ruta (ej. la app principal), ir al dashboard
      else if (!currentPath.startsWith('/cms')) {
        navigate('/cms/dashboard', { replace: true });
      }
      // Si ya está en /cms/*, no hacer nada (ya está navegando internamente)
    }
  };

  const loadUserWithRole = async (authUser: any, redirectAfterLogin = false) => {
    try {
      // Usar la nueva Edge Function para verificar usuario
      const { data: response, error: functionError } = await supabase.functions.invoke('user_access_management_2026_02_09', {
        body: {
          action: 'verify_user',
          email: authUser.email
        }
      });

      if (functionError || !response?.success) {
        console.error('Error verifying user:', functionError || response?.error);
        
        // Fallback: intentar con el método anterior
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles_2026_02_08_22_02')
          .select('role')
          .eq('user_id', authUser.id)
          .single();

        if (roleError) {
          console.error('Error loading user role:', roleError);
          setError('Error cargando rol de usuario');
          return;
        }

        // Obtener perfil adicional si es cliente
        let profile = null;
        if (roleData.role === 'cliente') {
          const { data: profileData } = await supabase
            .from('client_profiles_2026_02_08_22_02')
            .select('*')
            .eq('user_id', authUser.id)
            .single();
          
          profile = profileData;
        }

        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: roleData.role,
          profile
        });

        // Redirigir según rol solo si viene de un login fresco
        if (redirectAfterLogin) {
          redirectByRole(roleData.role);
        }
        return;
      }

      // Usar datos de la Edge Function
      const userData = response.data.user;
      
      // Obtener perfil adicional si es cliente
      let profile = null;
      if (userData.role === 'cliente') {
        const { data: profileData } = await supabase
          .from('client_profiles_2026_02_08_22_02')
          .select('*')
          .eq('user_id', userData.id)
          .single();
        
        profile = profileData;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile,
        fullName: userData.fullName,
        department: userData.department,
        isActive: userData.isActive,
        lastLogin: userData.lastLogin,
        permissions: userData.rolePermissions
      });

      // Redirigir según rol solo si viene de un login fresco
      if (redirectAfterLogin) {
        redirectByRole(userData.role);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Error cargando datos de usuario');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = 'Error inesperado durante el login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasRole = (requiredRoles: string | string[]) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const isInternalUser = () => {
    return hasRole(['interno', 'admin', 'super_admin']);
  };

  const isClient = () => {
    return hasRole('cliente');
  };

  const canAccessDashboard = () => {
    return isInternalUser() || isClient();
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    hasRole,
    isInternalUser,
    isClient,
    canAccessDashboard,
    checkAuth
  };
};