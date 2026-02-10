/**
 * Configuración de dominios para Pessaro Capital
 * Maneja la separación entre el sitio principal y el portal de administración
 * Integrado con Vercel y Supabase para producción
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
  
  // En desarrollo, usar variables de entorno si están disponibles
  const mainDomain = import.meta.env.VITE_MAIN_DOMAIN || DOMAIN_CONFIG.MAIN_DOMAIN;
  const loginDomain = import.meta.env.VITE_LOGIN_DOMAIN || DOMAIN_CONFIG.LOGIN_DOMAIN;
  
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
  
  return currentDomain === mainDomain;
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

// Función estricta para verificar si debemos forzar el dominio de login
export const shouldForceLoginDomain = (): boolean => {
  const currentDomain = getCurrentDomain();
  const loginDomain = getEnvironmentDomain('login');
  
  // En desarrollo, no forzar
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

// Rutas que deben estar disponibles solo en el dominio de login
export const LOGIN_ONLY_ROUTES = [
  '/super-admin-login',
  '/super-admin-panel',
  '/login-interno',
  '/dashboard-interno',
  '/diagnostico-acceso',
  '/cms/setup',
  '/cms/login',
  '/cms/dashboard',
  '/cms/blog',
  '/cms/team',
  '/cms/services',
  '/cms/instruments',
  '/cms/media',
  '/cms/settings',
] as const;

// Rutas que deben estar disponibles solo en el dominio principal
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
  '/registro-cliente',
] as const;

// Función para verificar si una ruta debe estar en el dominio de login
export const isLoginRoute = (path: string): boolean => {
  return LOGIN_ONLY_ROUTES.some(route => path.startsWith(route));
};

// Función para verificar si una ruta debe estar en el dominio principal
export const isMainRoute = (path: string): boolean => {
  return MAIN_ONLY_ROUTES.some(route => path === route || (route === '/' && path === ''));
};

// Función para redirigir al dominio correcto con lógica estricta
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
  
  // Lógica estricta: si estamos en login.pessaro.cl, mantener solo rutas administrativas
  if (forceLoginDomain) {
    // Si estamos en el dominio de login pero la ruta no es administrativa, redirigir a login
    if (!shouldBeOnLogin) {
      window.location.href = getLoginDomainUrl('/super-admin-login');
      return;
    }
  } else {
    // Si la ruta debe estar en login pero estamos en main
    if (shouldBeOnLogin && isCurrentlyOnMain) {
      window.location.href = getLoginDomainUrl(path);
      return;
    }
    
    // Si la ruta debe estar en main pero estamos en login
    if (shouldBeOnMain && isCurrentlyOnLogin) {
      window.location.href = getMainDomainUrl(path);
      return;
    }
  }
};

// Función para forzar redirección al dominio de login si no estamos en una ruta válida
export const enforceLoginDomainRoutes = (currentPath: string): void => {
  if (typeof window === 'undefined') return;
  
  // Solo aplicar en el dominio de login en producción
  if (!shouldForceLoginDomain()) return;
  
  // Si no es una ruta de login válida, redirigir al login principal
  if (!isLoginRoute(currentPath)) {
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
  }
};

// Hook para manejar redirecciones automáticas
export const useDomainRedirect = () => {
  const checkAndRedirect = (path: string) => {
    redirectToCorrectDomain(path);
  };
  
  return { checkAndRedirect };
};