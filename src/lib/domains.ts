/**
 * Configuración de dominios para Pessaro Capital
 * Maneja la separación entre el sitio principal y el portal de administración
 * Integrado con Vercel y Supabase para producción
 * Lógica estricta para login.pessaro.cl
 */

// Configuración de dominios
export const DOMAIN_CONFIG = {
  // Dominio principal para el sitio web público
  MAIN_DOMAIN: 'pessaro.cl',
  // Subdominio para accesos administrativos
  LOGIN_DOMAIN: 'login.pessaro.cl',
  // Dominios de desarrollo/staging
  DEV_DOMAINS: ['localhost', '127.0.0.1', 'babr325dcb.skywork.website'],
} as const;

// Variables de entorno para detección dinámica
const getEnvironmentDomain = (type: 'main' | 'login'): string => {
  if (typeof window === 'undefined') {
    return type === 'main' ? DOMAIN_CONFIG.MAIN_DOMAIN : DOMAIN_CONFIG.LOGIN_DOMAIN;
  }
  
  // Priorizar variables de entorno de Vercel, luego Vite, luego defaults
  const mainDomain = import.meta.env.NEXT_PUBLIC_MAIN_DOMAIN || 
                     import.meta.env.VITE_MAIN_DOMAIN || 
                     DOMAIN_CONFIG.MAIN_DOMAIN;
  const loginDomain = import.meta.env.NEXT_PUBLIC_LOGIN_DOMAIN || 
                      import.meta.env.VITE_LOGIN_DOMAIN || 
                      DOMAIN_CONFIG.LOGIN_DOMAIN;
  
  return type === 'main' ? mainDomain : loginDomain;
};

// Función para detectar el dominio actual
export const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
};

// Función para verificar si estamos en el dominio principal
export const isMainDomain = (): boolean => {
  const currentDomain = getCurrentDomain();
  const mainDomain = getEnvironmentDomain('main');
  
  // En desarrollo, permitir acceso desde cualquier dominio de desarrollo
  if ((DOMAIN_CONFIG.DEV_DOMAINS as readonly string[]).includes(currentDomain)) {
    return true;
  }
  
  return currentDomain === mainDomain || currentDomain === `www.${mainDomain}`;
};

// Función para verificar si estamos en el dominio de login
export const isLoginDomain = (): boolean => {
  const currentDomain = getCurrentDomain();
  const loginDomain = getEnvironmentDomain('login');
  
  return currentDomain === loginDomain;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = (): boolean => {
  const currentDomain = getCurrentDomain();
  return (DOMAIN_CONFIG.DEV_DOMAINS as readonly string[]).includes(currentDomain);
};

// Función ESTRICTA para verificar si debemos forzar el dominio de login
export const shouldForceLoginDomain = (): boolean => {
  const currentDomain = getCurrentDomain();
  const loginDomain = getEnvironmentDomain('login');
  
  // En desarrollo, no forzar para permitir testing
  if (isDevelopment()) return false;
  
  // En producción, verificar si estamos exactamente en el dominio de login
  return currentDomain === loginDomain;
};

// Función para obtener la URL completa del dominio principal
export const getMainDomainUrl = (path: string = ''): string => {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'https:';
  const domain = isDevelopment() ? getCurrentDomain() : getEnvironmentDomain('main');
  const port = isDevelopment() && getCurrentDomain().includes('localhost') ? ':5173' : '';
  return `${protocol}//${domain}${port}${path}`;
};

// Función para obtener la URL completa del dominio de login
export const getLoginDomainUrl = (path: string = ''): string => {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'https:';
  
  // En desarrollo, usar el dominio actual con rutas específicas
  if (isDevelopment()) {
    const domain = getCurrentDomain();
    const port = domain.includes('localhost') ? ':5173' : '';
    return `${protocol}//${domain}${port}${path}`;
  }
  
  // En producción, usar el subdominio de login con variables de entorno
  const loginDomain = getEnvironmentDomain('login');
  return `${protocol}//${loginDomain}${path}`;
};

// Rutas que deben estar disponibles SOLO en el dominio de login
export const LOGIN_ONLY_ROUTES = [
  '/super-admin-login',
  '/super-admin-panel',
  '/recuperar-contrasena',
  '/login-interno',
  '/dashboard-interno',
  '/wyckoff-dashboard',
  '/diagnostico-acceso',
  '/cms/setup',
  '/cms/login',
  '/cms/dashboard',
  '/cms/pages',
  '/cms/faqs',
  '/cms/blog',
  '/cms/team',
  '/cms/services',
  '/cms/instruments',
  '/cms/media',
  '/cms/settings',
] as const;

// Rutas que deben estar disponibles SOLO en el dominio principal
export const MAIN_ONLY_ROUTES = [
  '/',
  '/servicios',
  '/instrumentos',
  '/educacion',
  '/base-conocimientos',
  '/blog',
  '/nosotros',
  '/contacto',
  '/portal-cliente',
  '/portal-cliente/dashboard',
  '/registro-cliente',
] as const;

// Función para verificar si una ruta debe estar en el dominio de login
export const isLoginRoute = (path: string): boolean => {
  return LOGIN_ONLY_ROUTES.some(route => path.startsWith(route));
};

// Función para verificar si una ruta debe estar en el dominio principal
export const isMainRoute = (path: string): boolean => {
  return MAIN_ONLY_ROUTES.some(route => 
    path === route || 
    (route === '/' && path === '') ||
    (route !== '/' && path.startsWith(route + '/'))
  );
};

// Función para redirigir al dominio correcto con lógica ESTRICTA
export const redirectToCorrectDomain = (path: string): void => {
  if (typeof window === 'undefined') return;
  
  const currentDomain = getCurrentDomain();
  const isCurrentlyOnMain = isMainDomain();
  const isCurrentlyOnLogin = isLoginDomain();
  const shouldBeOnLogin = isLoginRoute(path);
  const shouldBeOnMain = isMainRoute(path);
  const forceLoginDomain = shouldForceLoginDomain();
  
  // Si estamos en desarrollo, no redirigir
  if (isDevelopment()) return;
  
  // LÓGICA ESTRICTA: si estamos en login.pessaro.cl, mantener SOLO rutas administrativas
  if (forceLoginDomain) {
    // Si estamos en el dominio de login pero la ruta no es administrativa, redirigir a login
    if (!shouldBeOnLogin) {
      console.log(`[DOMAIN] Enforcing login domain: ${path} -> /super-admin-login`);
      window.location.replace(getLoginDomainUrl('/super-admin-login'));
      return;
    }
  } else {
    // Lógica normal de redirección entre dominios
    // Si la ruta debe estar en login pero estamos en main
    if (shouldBeOnLogin && isCurrentlyOnMain) {
      console.log(`[DOMAIN] Redirecting to login domain: ${path}`);
      window.location.href = getLoginDomainUrl(path);
      return;
    }
    
    // Si la ruta debe estar en main pero estamos en login
    if (shouldBeOnMain && isCurrentlyOnLogin) {
      console.log(`[DOMAIN] Redirecting to main domain: ${path}`);
      window.location.href = getMainDomainUrl(path);
      return;
    }
  }
};

// Función para FORZAR redirección al dominio de login si no estamos en una ruta válida
export const enforceLoginDomainRoutes = (currentPath: string): void => {
  if (typeof window === 'undefined') return;
  
  // Solo aplicar en el dominio de login en producción
  if (!shouldForceLoginDomain()) return;
  
  console.log(`[DOMAIN] Enforcing login domain routes for: ${currentPath}`);
  
  // Si no es una ruta de login válida, redirigir al login principal
  if (!isLoginRoute(currentPath)) {
    console.log(`[DOMAIN] Invalid route for login domain, redirecting: ${currentPath} -> /super-admin-login`);
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
  }
};

// Funciones para generar URLs absolutas correctas
export const generateAbsoluteUrl = (path: string, forceMainDomain: boolean = false): string => {
  if (typeof window === 'undefined') {
    return forceMainDomain ? `https://${DOMAIN_CONFIG.MAIN_DOMAIN}${path}` : path;
  }
  
  // En desarrollo, usar la URL actual
  if (isDevelopment()) {
    return `${window.location.protocol}//${window.location.host}${path}`;
  }
  
  // En producción, determinar el dominio correcto
  if (forceMainDomain || isMainRoute(path)) {
    return getMainDomainUrl(path);
  }
  
  if (isLoginRoute(path)) {
    return getLoginDomainUrl(path);
  }
  
  // Por defecto, usar el dominio principal
  return getMainDomainUrl(path);
};

// Función específica para enlaces del sitio principal
export const getMainSiteUrl = (path: string): string => {
  return generateAbsoluteUrl(path, true);
};

// Función específica para enlaces administrativos
export const getAdminUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    return `https://${DOMAIN_CONFIG.LOGIN_DOMAIN}${path}`;
  }
  
  if (isDevelopment()) {
    return `${window.location.protocol}//${window.location.host}${path}`;
  }
  
  return getLoginDomainUrl(path);
};

// URLs de ejemplo para documentación
export const EXAMPLE_URLS = {
  MAIN_SITE: {
    HOME: 'https://pessaro.cl/',
    REGISTRO_CLIENTE: 'https://pessaro.cl/registro-cliente',
    BASE_CONOCIMIENTOS: 'https://pessaro.cl/base-conocimientos',
    SERVICIOS: 'https://pessaro.cl/servicios',
    INSTRUMENTOS: 'https://pessaro.cl/instrumentos',
    BLOG: 'https://pessaro.cl/blog',
    CONTACTO: 'https://pessaro.cl/contacto'
  },
  ADMIN_SITE: {
    SUPER_ADMIN: 'https://login.pessaro.cl/super-admin-login',
    INTERNAL_LOGIN: 'https://login.pessaro.cl/login-interno',
    DASHBOARD: 'https://login.pessaro.cl/dashboard-interno',
    CMS: 'https://login.pessaro.cl/cms/dashboard'
  }
} as const;

// Función para verificar si una ruta específica está permitida en el dominio actual
export const isRouteAllowedInCurrentDomain = (path: string): boolean => {
  const forceLoginDomain = shouldForceLoginDomain();
  const isCurrentlyOnMain = isMainDomain();
  
  // En desarrollo, permitir todas las rutas
  if (isDevelopment()) return true;
  
  // Si estamos en el dominio de login, solo permitir rutas administrativas
  if (forceLoginDomain) {
    return isLoginRoute(path);
  }
  
  // Si estamos en el dominio principal, permitir rutas principales
  if (isCurrentlyOnMain) {
    return isMainRoute(path);
  }
  
  return false;
};

// Hook para manejar redirecciones automáticas
export const useDomainRedirect = () => {
  const checkAndRedirect = (path: string) => {
    redirectToCorrectDomain(path);
  };
  
  const enforceRoutes = (path: string) => {
    enforceLoginDomainRoutes(path);
  };
  
  const isRouteAllowed = (path: string): boolean => {
    return isRouteAllowedInCurrentDomain(path);
  };
  
  return { 
    checkAndRedirect, 
    enforceRoutes, 
    isRouteAllowed,
    shouldForceLoginDomain: shouldForceLoginDomain(),
    isLoginDomain: isLoginDomain(),
    isMainDomain: isMainDomain(),
    isDevelopment: isDevelopment()
  };
};