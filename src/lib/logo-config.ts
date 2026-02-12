/**
 * Configuración optimizada de logos e imágenes para Pessaro Capital
 * Utiliza las nuevas imágenes cargadas con diferentes resoluciones según el contexto
 */

import { IMAGES } from '@/assets/images';

// Configuración de logos por contexto
export const LOGO_CONFIG = {
  // Logo principal para hero sections y páginas principales
  MAIN: IMAGES.LOGO_MAIN, // 512px - Alta resolución
  
  // Logo para header/navegación
  HEADER: IMAGES.LOGO_HEADER, // 256px - Resolución media
  
  // Logo para footer
  FOOTER: IMAGES.LOGO_FOOTER, // 128px - Resolución pequeña
  
  // Logo para dispositivos móviles
  MOBILE: IMAGES.LOGO_MOBILE, // 128px - Optimizado para móvil
  
  // Favicon para navegadores
  FAVICON: IMAGES.LOGO_FAVICON, // 512px PNG para mejor compatibilidad
} as const;

// Configuración de favicons por tamaño
export const FAVICON_CONFIG = {
  ICO: '/favicon.ico',
  PNG_16: '/images/favicon-16.png',
  PNG_32: '/images/favicon-32.png', 
  PNG_64: '/images/favicon-64.png',
  PNG_128: '/images/favicon-128.png',
  PNG_192: '/images/favicon-192.png',
  PNG_256: '/images/favicon-256.png',
  PNG_512: '/images/favicon-512.png',
  APPLE_TOUCH: '/images/apple-touch-icon.png',
  WEBP_64: '/images/favicon-64.webp',
} as const;

// Función para obtener el logo apropiado según el contexto
export const getLogoForContext = (context: 'main' | 'header' | 'footer' | 'mobile' = 'main'): string => {
  switch (context) {
    case 'header':
      return LOGO_CONFIG.HEADER;
    case 'footer':
      return LOGO_CONFIG.FOOTER;
    case 'mobile':
      return LOGO_CONFIG.MOBILE;
    case 'main':
    default:
      return LOGO_CONFIG.MAIN;
  }
};

// Función para obtener el favicon apropiado según el tamaño
export const getFaviconForSize = (size: 16 | 32 | 64 | 128 | 192 | 256 | 512 = 32): string => {
  switch (size) {
    case 16:
      return FAVICON_CONFIG.PNG_16;
    case 32:
      return FAVICON_CONFIG.PNG_32;
    case 64:
      return FAVICON_CONFIG.PNG_64;
    case 128:
      return FAVICON_CONFIG.PNG_128;
    case 192:
      return FAVICON_CONFIG.PNG_192;
    case 256:
      return FAVICON_CONFIG.PNG_256;
    case 512:
      return FAVICON_CONFIG.PNG_512;
    default:
      return FAVICON_CONFIG.PNG_32;
  }
};

// Configuración de imágenes optimizadas para diferentes dispositivos
export const RESPONSIVE_IMAGES = {
  // Configuración para diferentes breakpoints
  MOBILE: {
    logo: LOGO_CONFIG.MOBILE,
    maxWidth: '128px',
    sizes: '(max-width: 768px) 128px',
  },
  TABLET: {
    logo: LOGO_CONFIG.HEADER,
    maxWidth: '256px', 
    sizes: '(min-width: 769px) and (max-width: 1024px) 256px',
  },
  DESKTOP: {
    logo: LOGO_CONFIG.MAIN,
    maxWidth: '512px',
    sizes: '(min-width: 1025px) 512px',
  },
} as const;

export default LOGO_CONFIG;