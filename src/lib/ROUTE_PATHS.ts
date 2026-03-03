/**
 * Pessaro Capital - Rutas Oficiales
 * Fuente única de verdad para todas las rutas de la aplicación.
 * Generado a partir de domains.ts y la estructura de páginas del proyecto.
 */

export const ROUTE_PATHS = {
  // ── Sitio Principal ──────────────────────────────────────────────────────
  HOME: '/',
  SERVICIOS: '/servicios',
  INSTRUMENTOS: '/instrumentos',
  EDUCACION: '/educacion',
  BASE_CONOCIMIENTOS: '/base-conocimientos',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
  NOSOTROS: '/nosotros',
  CONTACTO: '/contacto',
  PORTAL_CLIENTE: '/portal-cliente',
  CLIENT_REGISTER: '/registro-cliente',

  // ── Administración / Login Domain ────────────────────────────────────────
  SUPER_ADMIN_LOGIN: '/super-admin-login',
  SUPER_ADMIN_PANEL: '/super-admin-panel',
  INTERNAL_LOGIN: '/login-interno',
  INTERNAL_DASHBOARD: '/dashboard-interno',
  WYCKOFF_DASHBOARD: '/wyckoff-dashboard',
  DIAGNOSTICO_ACCESO: '/diagnostico-acceso',

  // ── CMS ──────────────────────────────────────────────────────────────────
  CMS_SETUP: '/cms/setup',
  CMS_LOGIN: '/cms/login',
  CMS_DASHBOARD: '/cms/dashboard',
  CMS_PAGES: '/cms/pages',
  CMS_FAQS: '/cms/faqs',
  CMS_BLOG: '/cms/blog',
  CMS_TEAM: '/cms/team',
  CMS_SERVICES: '/cms/services',
  CMS_INSTRUMENTS: '/cms/instruments',
  CMS_MEDIA: '/cms/media',
  CMS_SETTINGS: '/cms/settings',
} as const;

export type RoutePath = typeof ROUTE_PATHS[keyof typeof ROUTE_PATHS];
