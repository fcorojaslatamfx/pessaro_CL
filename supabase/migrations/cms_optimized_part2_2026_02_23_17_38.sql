-- =============================================
-- CMS OPTIMIZADO - PARTE 2: BLOG, FAQS, SETTINGS, MEDIA
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

-- Tabla de artículos del blog
CREATE TABLE IF NOT EXISTS public.cms_blog_posts_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_name TEXT DEFAULT 'Pessaro Capital',
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time INTEGER DEFAULT 5,
    views INTEGER DEFAULT 0
);

-- Tabla de FAQs
CREATE TABLE IF NOT EXISTS public.cms_faqs_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faq_id TEXT UNIQUE NOT NULL, -- 'faq-forex', 'faq-commodities', etc.
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS public.cms_site_settings_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    description TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de medios/archivos
CREATE TABLE IF NOT EXISTS public.cms_media_files_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    alt_text TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);