
/**
 * Pessaro Capital - Constantes de Logos
 * Exporta las rutas de logos usadas en toda la aplicación.
 * Todas las imágenes deben existir en /public/images/.
 */

// Logo principal institucional
export const PESSARO_LOGO = '/images/logotype.png';

// Logo usado en el header (versión horizontal)
export const PESSARO_LOGO_HEADER = '/images/pessarocl-logo-header.png';

// Logo usado en el footer (puede ser el mismo logotype)
export const PESSARO_LOGO_FOOTER = '/images/logotype.png';

// Logo para dispositivos móviles
export const PESSARO_LOGO_MOBILE = '/images/pessarocl_capital_mobile_1.png';

// Variantes de resolución (todas existen en /public/images/)
export const LOGO_128 = '/images/logo-128.png';
export const LOGO_192 = '/images/logo-192.png';
export const LOGO_256 = '/images/logo-256.png';
export const LOGO_512 = '/images/logo-512.png';

// Export agrupado opcional
export const LOGOS = {
  MAIN: PESSARO_LOGO,
  HEADER: PESSARO_LOGO_HEADER,
  FOOTER: PESSARO_LOGO_FOOTER,
  MOBILE: PESSARO_LOGO_MOBILE,
  SIZE_128: LOGO_128,
  SIZE_192: LOGO_192,
  SIZE_256: LOGO_256,
  SIZE_512: LOGO_512,
} as const;

export type LogoKey = keyof typeof LOGOS;
