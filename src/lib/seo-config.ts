// ─── SEO config centralizada para todas las páginas públicas ─────────────────
// Editar aquí para actualizar meta tags sin tocar cada página individualmente.

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  jsonLd?: object;
}

const BASE_CL = 'https://pessaro.cl';

// ─── Datos de la organización (sin spread — evita @type duplicado) ────────────
const ORG_ID    = `${BASE_CL}/#organization`;
const ORG_NAME  = 'Pessaro Capital';
const ORG_URL   = BASE_CL;
const ORG_LOGO  = `${BASE_CL}/favicon-512.png`;
const ORG_PHONE = '+56922071511';
const ORG_EMAIL = 'contacto@pessaro.cl';
const ORG_ADDRESS = {
  '@type': 'PostalAddress',
  addressCountry: 'CL',
  addressLocality: 'Santiago',
  addressRegion: 'Región Metropolitana',
};
const ORG_SAME_AS = [
  'https://www.linkedin.com/company/pessarocapital',
  'https://pessarocapital.com',
];

// Helper para reutilizar datos de la org sin spread (que causaba @type duplicado)
const orgRef = () => ({
  '@type': 'FinancialService' as const,
  '@id': ORG_ID,
  name: ORG_NAME,
  url: ORG_URL,
  logo: ORG_LOGO,
  telephone: ORG_PHONE,
  email: ORG_EMAIL,
  address: ORG_ADDRESS,
  sameAs: ORG_SAME_AS,
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEO POR PÁGINA
// ═══════════════════════════════════════════════════════════════════════════════
export const PAGE_SEO: Record<string, PageSEO> = {

  // ── HOME ───────────────────────────────────────────────────────────────────
  home: {
    title: 'Pessaro Capital — Trading e Inversiones Financieras en Chile',
    description:
      'Accede a los mercados financieros globales con Pessaro Capital. '
      + 'Forex, materias primas, índices y criptomonedas con spreads competitivos, '
      + 'apalancamiento flexible y tecnología de vanguardia. Gestión profesional desde Chile para LATAM.',
    keywords:
      'trading Chile, forex Chile, inversiones financieras, Pessaro Capital, '
      + 'mercados financieros, CFD, apalancamiento, spreads competitivos, LATAM trading',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FinancialService',
      '@id': ORG_ID,
      name: ORG_NAME,
      url: ORG_URL,
      logo: ORG_LOGO,
      telephone: ORG_PHONE,
      email: ORG_EMAIL,
      address: ORG_ADDRESS,
      sameAs: ORG_SAME_AS,
      description:
        'Pessaro Capital es una plataforma de trading e inversiones con acceso '
        + 'a mercados financieros globales. Forex, commodities, índices y criptomonedas.',
      serviceType: [
        'Trading de Forex',
        'Inversión en Materias Primas',
        'Trading de Índices Bursátiles',
        'CopyTrading',
        'Gestión de Carteras',
      ],
      offers: {
        '@type': 'Offer',
        description: 'Cuentas de trading con spreads desde 0.0 pips',
      },
    },
  },

  // ── SERVICIOS ──────────────────────────────────────────────────────────────
  servicios: {
    title: 'Servicios de Trading e Inversión — Pessaro Capital',
    description:
      'Descubre los servicios financieros de Pessaro Capital: gestión de carteras, '
      + 'CopyTrading, asesoría en forex, acceso a mercados globales y cuentas '
      + 'gestionadas. Soluciones financieras de clase mundial para inversores en Chile y LATAM.',
    keywords:
      'servicios trading, gestión de carteras, copytrading, asesoría financiera, '
      + 'cuentas gestionadas, forex Chile, inversión LATAM, Pessaro Capital servicios',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      provider: orgRef(),
      name: 'Servicios Financieros Pessaro Capital',
      description:
        'Servicios de trading, gestión de carteras, CopyTrading y asesoría '
        + 'financiera para inversores individuales e institucionales.',
      serviceType: 'Servicios Financieros',
      areaServed: ['CL', 'PE', 'CO', 'MX', 'AR'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catálogo de Servicios',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Gestión de Carteras' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CopyTrading' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asesoría en Forex' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Acceso a Mercados Globales' } },
        ],
      },
    },
  },

  // ── INSTRUMENTOS ───────────────────────────────────────────────────────────
  instrumentos: {
    title: 'Instrumentos Financieros — Forex, Índices, Commodities | Pessaro Capital',
    description:
      'Opera más de 100 instrumentos financieros con Pessaro Capital: pares de forex '
      + '(EUR/USD, GBP/USD, USD/JPY), materias primas (oro, petróleo), índices bursátiles '
      + '(S&P 500, Nasdaq) y criptomonedas. Spreads competitivos y ejecución ultrarrápida.',
    keywords:
      'forex EUR USD, instrumentos financieros, pares de divisas, materias primas trading, '
      + 'índices bursátiles, S&P 500, oro trading, criptomonedas CFD, petróleo trading Chile',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Instrumentos de Trading Pessaro Capital',
      description: 'Catálogo de instrumentos financieros disponibles para operar.',
      provider: orgRef(),
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Forex — Pares de Divisas Mayores y Menores' },
        { '@type': 'ListItem', position: 2, name: 'Commodities — Oro, Petróleo, Plata' },
        { '@type': 'ListItem', position: 3, name: 'Índices — S&P 500, Nasdaq, DAX, FTSE' },
        { '@type': 'ListItem', position: 4, name: 'Criptomonedas — BTC, ETH, y más' },
        { '@type': 'ListItem', position: 5, name: 'Acciones — Mercado estadounidense y global' },
      ],
    },
  },

  // ── EDUCACIÓN ──────────────────────────────────────────────────────────────
  educacion: {
    title: 'Centro de Educación Financiera — Aprende a Invertir | Pessaro Capital',
    description:
      'Aprende trading desde cero con el Centro de Educación de Pessaro Capital. '
      + 'Cursos de forex, análisis técnico y fundamental, gestión de riesgo, '
      + 'metodología Wyckoff y estrategias de inversión. Rutas de aprendizaje para todos los niveles.',
    keywords:
      'educación financiera, aprender trading, cursos forex, análisis técnico, '
      + 'gestión de riesgo trading, metodología Wyckoff, trading para principiantes Chile',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Centro de Educación Financiera — Pessaro Capital',
      description:
        'Cursos y recursos educativos de trading e inversiones financieras. '
        + 'Desde principiante hasta trader profesional.',
      provider: orgRef(),
      teaches: [
        'Trading de Forex',
        'Análisis Técnico',
        'Análisis Fundamental',
        'Gestión de Riesgo',
        'Metodología Wyckoff',
        'Psicología del Trading',
      ],
    },
  },

  // ── BLOG ───────────────────────────────────────────────────────────────────
  blog: {
    title: 'Blog de Mercados Financieros — Análisis y Estrategias | Pessaro Capital',
    description:
      'Análisis semanal de mercados financieros, estrategias de trading, '
      + 'noticias económicas y perspectivas de inversión. '
      + 'Artículos escritos por expertos de Pessaro Capital sobre forex, commodities e índices.',
    keywords:
      'blog trading, análisis mercados financieros, estrategias forex, noticias economía, '
      + 'perspectivas inversión, análisis técnico semanal, EUR USD análisis, oro precio',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog de Mercados — Pessaro Capital',
      description: 'Análisis de mercados financieros y estrategias de trading.',
      publisher: orgRef(),
      inLanguage: 'es-CL',
      url: `${BASE_CL}/blog`,
    },
  },

  // ── NOSOTROS ───────────────────────────────────────────────────────────────
  nosotros: {
    title: 'Quiénes Somos — Más de una Década en Mercados Financieros | Pessaro Capital',
    description:
      'Pessaro Capital: empresa chilena con más de una década de innovación financiera. '
      + 'Equipo de profesionales con experiencia en banca de inversión, análisis cuantitativo '
      + 'y sistemas financieros. Transparencia, excelencia e innovación como pilares fundamentales.',
    keywords:
      'Pessaro Capital empresa, quiénes somos, equipo financiero Chile, '
      + 'banca inversión Chile, empresa trading Chile, innovación financiera LATAM',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Sobre Pessaro Capital',
      description:
        'Empresa financiera chilena con más de una década de experiencia en '
        + 'mercados globales, banca de inversión y análisis cuantitativo.',
      mainEntity: {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: ORG_NAME,
        url: ORG_URL,
        foundingDate: '2013',
        foundingLocation: {
          '@type': 'Place',
          address: { '@type': 'PostalAddress', addressCountry: 'CL', addressLocality: 'Santiago' },
        },
        knowsAbout: ['Forex', 'Mercados de Capitales', 'Análisis Cuantitativo', 'Gestión de Riesgo'],
      },
    },
  },

  // ── CONTACTO ───────────────────────────────────────────────────────────────
  contacto: {
    title: 'Contacto — Habla con un Asesor Financiero | Pessaro Capital',
    description:
      'Contáctanos para recibir asesoría personalizada en trading e inversiones. '
      + 'Disponibles por email, teléfono y LinkedIn. '
      + 'Respuesta en menos de 24 horas hábiles. Santiago, Chile.',
    keywords:
      'contacto Pessaro Capital, asesor financiero Chile, consulta trading, '
      + 'soporte inversiones, hablar con asesor forex',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contacto — Pessaro Capital',
      description: 'Página de contacto para consultas de trading e inversiones.',
      mainEntity: {
        '@type': 'ContactPoint',
        telephone: ORG_PHONE,
        email: ORG_EMAIL,
        contactType: 'customer service',
        areaServed: ['CL', 'LATAM'],
        availableLanguage: ['es'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      },
    },
  },

  // ── REGISTRO CLIENTE ───────────────────────────────────────────────────────
  registro: {
    title: 'Abre tu Cuenta — Empieza a Invertir Hoy | Pessaro Capital',
    description:
      'Abre tu cuenta en Pessaro Capital en minutos. '
      + 'Accede a mercados financieros globales con condiciones institucionales. '
      + 'Proceso 100% online, rápido y seguro.',
    keywords:
      'abrir cuenta trading, registro Pessaro Capital, cuenta inversión Chile, '
      + 'cuenta forex, apertura cuenta trading online',
  },

  // ── PORTAL CLIENTE ─────────────────────────────────────────────────────────
  portalCliente: {
    title: 'Portal de Clientes — Acceso Exclusivo | Pessaro Capital',
    description:
      'Accede a tu portal exclusivo de cliente Pessaro Capital. '
      + 'Consulta tus posiciones, análisis de mercado exclusivos y recursos premium.',
    keywords: 'portal clientes Pessaro, login trading, acceso cuenta inversión',
  },

  // ── BLOG POST (dinámico — se sobreescribe en BlogPostPage con datos reales) ─
  blogPost: {
    title: 'Artículo | Pessaro Capital',
    description: 'Análisis de mercados financieros por Pessaro Capital.',
    keywords: 'análisis trading, mercados financieros, Pessaro Capital blog',
  },

};
