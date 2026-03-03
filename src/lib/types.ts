/**
 * Pessaro Capital - Tipos e Interfaces Institucionales
 * Fuente única de verdad para los tipos de dominio del negocio.
 */

// ── Mercados ────────────────────────────────────────────────────────────────

export type MarketCategory =
  | 'forex'
  | 'crypto'
  | 'stocks'
  | 'commodities'
  | 'indices';

// ── Servicios ───────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  benefits?: string[];
  features?: string[];
  order?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Instrumentos de Trading ─────────────────────────────────────────────────

export interface TradingInstrument {
  id: string;
  name: string;
  symbol: string;
  category: MarketCategory;
  spread: string;
  leverage: string;
  trending: 'up' | 'down';
  isPopular?: boolean;
  icon_url?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Equipo ──────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

// ── FAQ ─────────────────────────────────────────────────────────────────────

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

// ── Contacto ────────────────────────────────────────────────────────────────

export interface ContactInfo {
  phone: string;
  email: string;
  address?: string;
  whatsapp?: string;
  linkedin?: string;
  instagram?: string;
}

// ── Blog ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author_id?: string;
  author_name?: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
