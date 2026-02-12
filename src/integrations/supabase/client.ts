import { createClient } from '@supabase/supabase-js'

// Usar las variables de entorno inyectadas por la integración oficial de Vercel con Supabase
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                   import.meta.env.VITE_SUPABASE_URL || 
                   'https://ldlflxujrjihiybrcree.supabase.co'

const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbGZseHVqcmppaGl5YnJjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDEzMTksImV4cCI6MjA4NTM3NzMxOX0._P7GGsOBMnG3xzGVWi9FZX4z3a12txMX52nKwNYgquE'

// Configuración de auth con redirects específicos por dominio
const getAuthRedirectUrl = (targetRoute?: string): string => {
  if (typeof window === 'undefined') {
    return `https://login.pessaro.cl${targetRoute || '/super-admin-panel'}`;
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // En desarrollo, usar el dominio actual
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('skywork.website')) {
    const port = window.location.port ? ':' + window.location.port : '';
    return `${protocol}//${hostname}${port}${targetRoute || '/super-admin-panel'}`;
  }
  
  // En producción, siempre redirigir al dominio de login
  return `https://login.pessaro.cl${targetRoute || '/super-admin-panel'}`;
};

// Crear cliente Supabase con configuración optimizada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Funciones helper para operaciones de auth con redirects específicos
export const getAuthRedirectForOperation = (operation: 'login' | 'signup' | 'reset' = 'login'): string => {
  switch (operation) {
    case 'login':
      return getAuthRedirectUrl('/super-admin-panel');
    case 'signup':
      return getAuthRedirectUrl('/super-admin-panel');
    case 'reset':
      return getAuthRedirectUrl('/super-admin-login');
    default:
      return getAuthRedirectUrl('/super-admin-panel');
  }
};

// Función para login con redirect específico
export const signInWithRedirect = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data.user) {
    // Redirigir manualmente después del login exitoso
    window.location.href = getAuthRedirectForOperation('login');
  }
  
  return { data, error };
};

// Función para signup con redirect específico
export const signUpWithRedirect = async (email: string, password: string, options?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...options,
      emailRedirectTo: getAuthRedirectForOperation('signup')
    }
  });
  
  return { data, error };
};

// Función para reset password con redirect específico
export const resetPasswordWithRedirect = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectForOperation('reset')
  });
  
  return { data, error };
};

// Función para obtener la URL base del dominio de login
export const getLoginDomainBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'https://login.pessaro.cl';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // En desarrollo
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('skywork.website')) {
    const port = window.location.port ? ':' + window.location.port : '';
    return `${protocol}//${hostname}${port}`;
  }
  
  // En producción
  return 'https://login.pessaro.cl';
};

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";