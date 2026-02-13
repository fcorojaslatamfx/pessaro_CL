/**
 * Pessaro Capital - Core Library
 * Definición de rutas, tipos e interfaces para la plataforma financiera.
 */

export const ROUTE_PATHS = {
  HOME: '/',
  SERVICIOS: '/servicios',
  INSTRUMENTOS: '/instrumentos',
  EDUCACION: '/educacion',
  BLOG: '/blog',
  NOSOTROS: '/nosotros',
  CONTACTO: '/contacto',
  // Client Portal
  CLIENT_PORTAL: '/portal-cliente',
  CLIENT_REGISTER: '/registro-cliente',
  // Super Admin System
  SUPER_ADMIN_LOGIN: '/super-admin-login',
  SUPER_ADMIN_PANEL: '/super-admin-panel',
  // Internal Dashboard
  INTERNAL_DASHBOARD: '/dashboard-interno',
  INTERNAL_LOGIN: '/login-interno',
  // Wyckoff Dashboard (Internal Only)
  WYCKOFF_DASHBOARD: '/wyckoff-dashboard',
  // Access Diagnostic
  ACCESS_DIAGNOSTIC: '/diagnostico-acceso',
  // CMS Routes
  CMS_SETUP: '/cms/setup',
  CMS_LOGIN: '/cms/login',
  CMS_DASHBOARD: '/cms/dashboard',
  CMS_BLOG: '/cms/blog',
  CMS_TEAM: '/cms/team',
  CMS_SERVICES: '/cms/services',
  CMS_INSTRUMENTS: '/cms/instruments',
  CMS_MEDIA: '/cms/media',
  CMS_SETTINGS: '/cms/settings',
  // Error Page
  ERROR: '/error',
} as const;

export type MarketCategory = 'Forex' | 'Commodities' | 'Indices' | 'Acciones' | 'ETF' | 'Criptomonedas';

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string; // Nombre del icono de Lucide
  longDescription?: string;
  benefits: string[];
}

export interface TradingInstrument {
  id: string;
  symbol: string;
  name: string;
  category: MarketCategory;
  spread: string;
  leverage: string;
  trending?: 'up' | 'down' | 'neutral';
  isPopular?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  office: string;
  hours: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: 'Trading' | 'Mercados' | 'Análisis' | 'Educación' | 'Criptomonedas';
  tags: string[];
  readTime: number;
  image: string;
}

/**
 * Logo oficial de Pessaro Capital con fondo transparente para el website.
 */
import { IMAGES } from '@/assets/images';
export const PESSARO_LOGO = IMAGES.LOGO_MAIN; // Logo principal optimizado
export const PESSARO_LOGO_HEADER = IMAGES.LOGO_HEADER; // Logo para header
export const PESSARO_LOGO_FOOTER = IMAGES.LOGO_FOOTER; // Logo para footer
export const PESSARO_LOGO_MOBILE = IMAGES.LOGO_MOBILE; // Logo para móvil

/**
 * Utilidades de formateo para datos financieros en español.
 */
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export const formatCompactNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};