export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  author_id: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  linkedin_url?: string;
  twitter_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TradingInstrument {
  id: string;
  name: string;
  symbol: string;
  category: 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices';
  spread: string;
  leverage: string;
  icon_url?: string;
  is_popular: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'editor';
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  file_type: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  folder: string;
  created_at: string;
  created_by: string;
}

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  category: 'general' | 'contact' | 'social' | 'seo';
  created_at: string;
  updated_at: string;
}
