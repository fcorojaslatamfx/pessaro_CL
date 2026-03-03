/**
 * Pessaro Capital - Core Library Index
 * Exporta rutas, tipos, interfaces, logos y utilidades.
 * Punto único de acceso para toda la plataforma.
 */

// Rutas oficiales
export * from './ROUTE_PATHS';

// Configuración de dominios y lógica multi-dominio
export * from './domains';

// Tipos e interfaces institucionales
export type {
  MarketCategory,
  Service,
  TradingInstrument,
  TeamMember,
  FAQ,
  ContactInfo,
  BlogPost,
} from './types';

// Logos institucionales
export {
  PESSARO_LOGO,
  PESSARO_LOGO_HEADER,
  PESSARO_LOGO_FOOTER,
  PESSARO_LOGO_MOBILE,
} from './logos';

// Utilidades de formateo
export { formatCurrency, formatCompactNumber } from './utils';
