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
          await loadUserWithRole(session.user);
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

  const loadUserWithRole = async (authUser: any) => {
    try {
      // Obtener rol del usuario
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