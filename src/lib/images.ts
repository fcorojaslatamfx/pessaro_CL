// ------------------------------------------------------------
// AUTO-GENERADO — NO EDITAR EL OBJETO IMAGES MANUALMENTE
// ------------------------------------------------------------

export const IMAGES = {
  AI_FINANCIAL_REVOLUTION_20260213_113546_285: "/images/ai_financial_revolution_20260213_113546.png",
  ALAN_GREENSPAN: "/images/Alan-Greespan.webp",
  APPLE_TOUCH_ICON_20260211_153128_246: "/images/apple-touch-icon_20260211_153128.png",
  APPLE_TOUCH_ICON_273: "/images/apple-touch-icon.png",
  BITCOIN_ETF_INSTITUTIONAL_20260213_113545_287: "/images/bitcoin_etf_institutional_20260213_113545.png",

  // ------------------------------------------------------------
  // CORREGIDO: ruta válida y sintaxis correcta
  // ------------------------------------------------------------
  TRUMP_INAUGURATION_MARKETS_20260213_113546_281: "/images/trump_inauguration_markets_20260213_113546.png",

  WARREN_BUFFETT: "/images/Warren-Buffett.webp",
  WARREN_BUFFETT_197: "/images/Warren-Buffett.webp",
  YANET_YELLEN_194: "/images/Yanet-Yellen.webp"
} as const;

// ------------------------------------------------------------
// TIPOS DERIVADOS
// ------------------------------------------------------------

export type ImageKey = keyof typeof IMAGES;
export type ImagePath = (typeof IMAGES)[ImageKey];

// ------------------------------------------------------------
// CONSTANTES MANUALES
// ------------------------------------------------------------

export const PESSARO_LOGO_HEADER: ImagePath = "/images/logotype.png";

// ------------------------------------------------------------
// EXPORTS AGRUPADOS
// ------------------------------------------------------------

export const LOGOS = {
  HEADER: PESSARO_LOGO_HEADER,
  LOGOTYPE: "/images/logotype.png",
  LOGO_128: "/images/logo-128.png",
  LOGO_192: "/images/logo-192.png",
  LOGO_256: "/images/logo-256.png",
  LOGO_512: "/images/logo-512.png"
} as const;

export type LogoKey = keyof typeof LOGOS;
