-- =============================================
-- CMS OPTIMIZADO - PARTE 1: TABLAS PRINCIPALES
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLAS PRINCIPALES CMS
-- =============================================

-- Tabla de contenido de páginas (para secciones editables)
CREATE TABLE IF NOT EXISTS public.cms_page_content_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_slug TEXT NOT NULL, -- 'home', 'servicios', 'nosotros', etc.
    section_key TEXT NOT NULL, -- 'hero_title', 'hero_description', 'about_text', etc.
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image', 'json')),
    title TEXT,
    content TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_slug, section_key)
);

-- Tabla de servicios (para gestionar servicios financieros)
CREATE TABLE IF NOT EXISTS public.cms_services_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id TEXT UNIQUE NOT NULL, -- 'forex-trading', 'commodities', etc.
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    icon_name TEXT DEFAULT 'Globe',
    benefits TEXT[] DEFAULT '{}',
    features JSONB DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de instrumentos de trading
CREATE TABLE IF NOT EXISTS public.cms_instruments_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    spread TEXT NOT NULL,
    leverage TEXT NOT NULL,
    trending TEXT DEFAULT 'neutral' CHECK (trending IN ('up', 'down', 'neutral')),
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros del equipo
CREATE TABLE IF NOT EXISTS public.cms_team_members_2026_02_23_17_38 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);