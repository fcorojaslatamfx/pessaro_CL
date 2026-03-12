// ============================================================
// CMS TYPES — Sincronizados con la BD real (Supabase)
// Última revisión: 2026-03-12
// ============================================================

// cms_blog_posts_2026_02_23_17_38
// featured_image (NO cover_image), author_name (NO author_id)
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name?: string;
  category?: string;
  tags?: string[];
  status: 'published' | 'draft' | 'archived';
  published_at?: string | null;
  read_time?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

// cms_team_members_2026_02_23_17_38
// order_index (NO order)
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
  linkedin_url?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// cms_services_2026_02_23_17_38
// service_id, icon_name (NO icon), benefits[], features (jsonb), order_index (NO order)
export interface Service {
  id: string;
  service_id?: string;
  title: string;
  description: string;
  long_description?: string;
  icon_name?: string;
  benefits?: string[];
  features?: Record<string, any>;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// cms_instruments_2026_02_23_17_38
// NO tiene order/order_index ni icon_url
export interface TradingInstrument {
  id: string;
  symbol: string;
  name: string;
  category: string;
  spread: string;
  leverage: string;
  trending?: string;
  is_popular?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// cms_media_files_2026_02_23_17_38
// filename, original_name, file_path, file_size (NO size), mime_type (NO file_type)
// NO tiene: url, name, folder, created_by
export interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  description?: string;
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// cms_page_content_2026_02_23_17_38
// page_slug (real, NOT NULL), page_key (columna generada STORED = alias, solo lectura)
// content es text (NO Record<string,any>)
export interface PageContent {
  id: string;
  page_slug: string;
  page_key?: string;      // columna generada, solo lectura
  section_key: string;
  content_type?: string;
  title?: string;
  content?: string;
  image_url?: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// cms_site_settings_2026_02_23_17_38
// setting_value es text (NO any), setting_type existe también
export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  setting_type?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// cms_faqs_2026_02_23_17_38
export interface FAQ {
  id: string;
  faq_id: string;
  question: string;
  answer: string;
  category?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// user_profiles (pública)
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
