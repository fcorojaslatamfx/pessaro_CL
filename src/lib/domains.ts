/**
 * Configuración de dominios para Pessaro Capital
 * Maneja la separación entre el sitio principal y el portal de administración
 * Integrado con Vercel y Supabase para producción
 * Lógica estricta para login.pessaro.cl
 *
 * DOMINIOS SOPORTADOS:
 *   pessaro.cl          → sitio principal (repo pessaro_CL)
 *   www.pessaro.cl      → alias www del principal
 *   pessarocapital.com  → alias del principal (mismo build, mismo contenido)
 *   www.pessarocapital.com → alias www del alias
 *   login.pessaro.cl    → subdominio administrativo (CMS / staff)
 */

// Configuración de dominios
export const DOMAIN_CONFIG = {
  // Dominio principal para el sitio web público
  MAIN_DOMAIN: 'pessaro.cl',
  // Alias del dominio principal — mismo sitio, segundo dominio
  MAIN_DOMAIN_ALIAS: 'pessarocapital.com',
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

  const mainDomain =
    import.meta.env.NEXT_PUBLIC_MAIN_DOMAIN ||
    import.meta.env.VITE_MAIN_DOMAIN ||
    DOMAIN_CONFIG.MAIN_DOMAIN;
  const loginDomain =
    import.meta.env.NEXT_PUBLIC_LOGIN_DOMAIN ||
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
// Reconoce: pessaro.cl, www.pessaro.cl, pessarocapital.com, www.pessarocapital.com
export const isMainDomain = (): boolean => {
  const currentDomain = getCurrentDomain();
  const mainDomain = getEnvironmentDomain('main');

  // En desarrollo, permitir acceso desde cualquier dominio de desarrollo
  if ((DOMAIN_CONFIG.DEV_DOMAINS as readonly string[]).includes(currentDomain)) {
    return true;
  }

  return (
    currentDomain === mainDomain ||
    currentDomain === `www.${mainDomain}` ||
    currentDomain === DOMAIN_CONFIG.MAIN_DOMAIN_ALIAS ||
    currentDomain === `www.${DOMAIN_CONFIG.MAIN_DOMAIN_ALIAS}`
  );
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
  if (isDevelopment()) return false;
  return isLoginDomain();
};

// Función para obtener la URL del dominio principal
// Si el usuario está en pessarocapital.com, mantiene ese dominio para no forzar redirección
export const getMainDomainUrl = (path: string = ''): string => {
  const protocol = 'https:';

  if (isDevelopment()) {
    const domain = getCurrentDomain();
    const port = domain.includes('localhost') ? ':5173' : '';
    return `${protocol}//${domain}${port}${path}`;
  }

  // Respetar el dominio actual si es un alias válido del principal
  const current = getCurrentDomain();
  const isAlias =
    current === DOMAIN_CONFIG.MAIN_DOMAIN_ALIAS ||
    current === `www.${DOMAIN_CONFIG.MAIN_DOMAIN_ALIAS}`;
  const domain = isAlias ? current : getEnvironmentDomain('main');
  return `${protocol}//${domain}${path}`;
};

// Función para obtener la URL del dominio de login
export const getLoginDomainUrl = (path: string = ''): string => {
  const protocol = 'https:';

  if (isDevelopment()) {
    const domain = getCurrentDomain();
    const port = domain.includes('localhost') ? ':5173' : '';
    return `${protocol}//${domain}${port}${path}`;
  }

  const loginDomain = getEnvironmentDomain('login');
  return `${protocol}//${loginDomain}${path}`;
};

// Rutas disponibles SOLO en el dominio de login/admin
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

// Rutas disponibles en el dominio principal (pessaro.cl / pessarocapital.com)
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
  '/error',
  '/faq',
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

// Redirección entre dominios
export const redirectToCorrectDomain = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (isDevelopment()) return;

  const isCurrentlyOnMain = isMainDomain();
  const isCurrentlyOnLogin = isLoginDomain();
  const shouldBeOnLogin = isLoginRoute(path);
  const shouldBeOnMain = isMainRoute(path);
  const forceLoginDomain = shouldForceLoginDomain();

  // login.pessaro.cl: solo rutas admin
  if (forceLoginDomain && !shouldBeOnLogin) {
    console.log(`[DOMAIN] Enforcing login domain: ${path} -> /super-admin-login`);
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
    return;
  }

  // Desde dominio principal, ruta que debe estar en login
  if (shouldBeOnLogin && isCurrentlyOnMain) {
    console.log(`[DOMAIN] Redirecting to login domain: ${path}`);
    window.location.href = getLoginDomainUrl(path);
    return;
  }

  // Desde login, ruta que debe estar en main
  if (shouldBeOnMain && isCurrentlyOnLogin) {
    console.log(`[DOMAIN] Redirecting to main domain: ${path}`);
    window.location.href = getMainDomainUrl(path);
    return;
  }
};

// Forzar rutas válidas en login.pessaro.cl
export const enforceLoginDomainRoutes = (currentPath: string): void => {
  if (typeof window === 'undefined') return;
  if (!shouldForceLoginDomain()) return;

  if (!isLoginRoute(currentPath)) {
    console.log(`[DOMAIN] Invalid route for login domain, redirecting: ${currentPath} -> /super-admin-login`);
    window.location.replace(getLoginDomainUrl('/super-admin-login'));
  }
};

// Generar URL absoluta al dominio correcto
export const generateAbsoluteUrl = (path: string, forceMainDomain: boolean = false): string => {
  if (typeof window === 'undefined') {
    return forceMainDomain ? `https://${DOMAIN_CONFIG.MAIN_DOMAIN}${path}` : path;
  }

  if (isDevelopment()) {
    return `${window.location.protocol}//${window.location.host}${path}`;
  }

  if (forceMainDomain || isMainRoute(path)) {
    return getMainDomainUrl(path);
  }

  if (isLoginRoute(path)) {
    return getLoginDomainUrl(path);
  }

  return getMainDomainUrl(path);
};

// URL para enlaces del sitio principal
export const getMainSiteUrl = (path: string): string => {
  return generateAbsoluteUrl(path, true);
};

// URL para enlaces administrativos
export const getAdminUrl = (path: string): string => {
  if (typeof window === 'undefined') {
    return `https://${DOMAIN_CONFIG.LOGIN_DOMAIN}${path}`;
  }
  if (isDevelopment()) {
    return `${window.location.protocol}//${window.location.host}${path}`;
  }
  return getLoginDomainUrl(path);
};

// URLs de referencia
export const EXAMPLE_URLS = {
  MAIN_SITE: {
    HOME: 'https://pessaro.cl/',
    HOME_ALIAS: 'https://pessarocapital.com/',
    REGISTRO_CLIENTE: 'https://pessaro.cl/registro-cliente',
    BASE_CONOCIMIENTOS: 'https://pessaro.cl/base-conocimientos',
    SERVICIOS: 'https://pessaro.cl/servicios',
    INSTRUMENTOS: 'https://pessaro.cl/instrumentos',
    BLOG: 'https://pessaro.cl/blog',
    CONTACTO: 'https://pessaro.cl/contacto',
  },
  ADMIN_SITE: {
    SUPER_ADMIN: 'https://login.pessaro.cl/super-admin-login',
    INTERNAL_LOGIN: 'https://login.pessaro.cl/login-interno',
    CMS_LOGIN: 'https://login.pessaro.cl/cms/login',
    DASHBOARD: 'https://login.pessaro.cl/dashboard-interno',
    CMS: 'https://login.pessaro.cl/cms/dashboard',
  },
} as const;

// Verificar si una ruta está permitida en el dominio actual
export const isRouteAllowedInCurrentDomain = (path: string): boolean => {
  if (isDevelopment()) return true;
  if (shouldForceLoginDomain()) return isLoginRoute(path);
  if (isMainDomain()) return isMainRoute(path) || isLoginRoute(path);
  return false;
};

// Hook para manejar redirecciones automáticas
export const useDomainRedirect = () => {
  const checkAndRedirect = (path: string) => redirectToCorrectDomain(path);
  const enforceRoutes = (path: string) => enforceLoginDomainRoutes(path);
  const isRouteAllowed = (path: string): boolean => isRouteAllowedInCurrentDomain(path);

  return {
    checkAndRedirect,
    enforceRoutes,
    isRouteAllowed,
    shouldForceLoginDomain: shouldForceLoginDomain(),
    isLoginDomain: isLoginDomain(),
    isMainDomain: isMainDomain(),
    isDevelopment: isDevelopment(),
  };
};
