import { useEffect } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;          // URL canónica completa
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;           // true para páginas privadas/test
  jsonLd?: object;             // Schema.org JSON-LD específico de la página
  article?: {                  // Para blog posts
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
    section?: string;
  };
}

const SITE_NAME   = 'Pessaro Capital';
const BASE_URL_CL = 'https://pessaro.cl';
const BASE_URL_PC = 'https://pessarocapital.com';
const OG_IMAGE    = `${BASE_URL_CL}/og-image.png`;

// ─── Detectar dominio activo ──────────────────────────────────────────────────
const getBaseUrl = () => {
  if (typeof window === 'undefined') return BASE_URL_CL;
  return window.location.hostname.includes('pessarocapital.com')
    ? BASE_URL_PC
    : BASE_URL_CL;
};

// ─── Helper: set o crear meta tag ─────────────────────────────────────────────
const setMeta = (selector: string, content: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    // Extraer atributo del selector: [name="x"] o [property="x"]
    const nameMatch     = selector.match(/\[name="([^"]+)"\]/);
    const propertyMatch = selector.match(/\[property="([^"]+)"\]/);
    if (nameMatch)     el.setAttribute('name', nameMatch[1]);
    if (propertyMatch) el.setAttribute('property', propertyMatch[1]);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel: string, href: string, extra?: Record<string, string>) => {
  // Buscar existente
  let el = document.querySelector(`link[rel="${rel}"]${rel === 'alternate' ? `[hreflang="${extra?.hreflang}"]` : ''}`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
};

const setJsonLd = (id: string, data: object) => {
  let el = document.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 2);
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export const useSEO = (props: SEOProps) => {
  const {
    title,
    description,
    canonical,
    keywords,
    ogImage = OG_IMAGE,
    ogType = 'website',
    noIndex = false,
    jsonLd,
    article,
  } = props;

  useEffect(() => {
    const base    = getBaseUrl();
    const path    = window.location.pathname;
    const fullUrl = canonical || `${base}${path}`;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    // ── Título ────────────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Meta básicos ──────────────────────────────────────────────────────────
    setMeta('[name="description"]',      description);
    setMeta('[name="robots"]',           noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    if (keywords) setMeta('[name="keywords"]', keywords);

    // ── Canonical ─────────────────────────────────────────────────────────────
    setLink('canonical', fullUrl);

    // ── hreflang (ambos dominios apuntan al mismo contenido) ──────────────────
    if (!noIndex) {
      const clUrl = fullUrl.replace(BASE_URL_PC, BASE_URL_CL);
      const pcUrl = fullUrl.replace(BASE_URL_CL, BASE_URL_PC);
      setLink('alternate', clUrl, { hreflang: 'es-CL' });
      setLink('alternate', pcUrl, { hreflang: 'es'   });
      setLink('alternate', clUrl, { hreflang: 'x-default' });
    }

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta('[property="og:title"]',       fullTitle);
    setMeta('[property="og:description"]', description);
    setMeta('[property="og:type"]',        ogType);
    setMeta('[property="og:url"]',         fullUrl);
    setMeta('[property="og:image"]',       ogImage);
    setMeta('[property="og:site_name"]',   SITE_NAME);
    setMeta('[property="og:locale"]',      'es_CL');

    if (ogType === 'article' && article) {
      if (article.publishedTime) setMeta('[property="article:published_time"]', article.publishedTime);
      if (article.modifiedTime)  setMeta('[property="article:modified_time"]',  article.modifiedTime);
      if (article.author)        setMeta('[property="article:author"]',          article.author);
      if (article.section)       setMeta('[property="article:section"]',         article.section);
      article.tags?.forEach((tag, i) => setMeta(`[property="article:tag"][data-i="${i}"]`, tag));
    }

    // ── Twitter Card ──────────────────────────────────────────────────────────
    setMeta('[name="twitter:card"]',        'summary_large_image');
    setMeta('[name="twitter:title"]',       fullTitle);
    setMeta('[name="twitter:description"]', description);
    setMeta('[name="twitter:image"]',       ogImage);
    setMeta('[name="twitter:site"]',        '@pessarocapital');

    // ── JSON-LD personalizado por página ──────────────────────────────────────
    if (jsonLd) setJsonLd('page', jsonLd);

    // ── Cleanup al desmontar ──────────────────────────────────────────────────
    return () => {
      // No borramos meta tags globales, solo los que son únicos de la página
      const ldEl = document.querySelector('script[data-seo="page"]');
      if (ldEl) ldEl.remove();
    };
  }, [title, description, canonical, keywords, ogImage, ogType, noIndex]);
};
