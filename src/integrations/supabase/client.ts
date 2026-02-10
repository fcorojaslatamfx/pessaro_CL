import { createClient } from '@supabase/supabase-js'

// Usar las variables de entorno inyectadas por la integración oficial de Vercel con Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                   'https://ldlflxujrjihiybrcree.supabase.co'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbGZseHVqcmppaGl5YnJjcmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDEzMTksImV4cCI6MjA4NTM3NzMxOX0._P7GGsOBMnG3xzGVWi9FZX4z3a12txMX52nKwNYgquE'

// Configuración de auth con redirects específicos por dominio
const getAuthRedirectUrl = (): string => {
  if (typeof window === 'undefined') return 'https://login.pessaro.cl/super-admin-panel';
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // En desarrollo, usar el dominio actual
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('skywork.website')) {
    return `${protocol}//${hostname}${window.location.port ? ':' + window.location.port : ''}/super-admin-panel`;
  }
  
  // En producción, siempre redirigir al dominio de login
  return 'https://login.pessaro.cl/super-admin-panel';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función helper para obtener la URL de redirección en operaciones de auth
export const getAuthRedirectForOperation = (): string => {
  return getAuthRedirectUrl();
};

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
