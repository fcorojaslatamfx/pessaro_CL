-- =============================================
-- CMS OPTIMIZADO COMPLETO - PESSARO CAPITAL
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

-- =============================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX IF NOT EXISTS idx_cms_page_content_page_slug ON public.cms_page_content_2026_02_23_17_38(page_slug);
CREATE INDEX IF NOT EXISTS idx_cms_page_content_section_key ON public.cms_page_content_2026_02_23_17_38(section_key);
CREATE INDEX IF NOT EXISTS idx_cms_services_service_id ON public.cms_services_2026_02_23_17_38(service_id);
CREATE INDEX IF NOT EXISTS idx_cms_services_active ON public.cms_services_2026_02_23_17_38(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_instruments_symbol ON public.cms_instruments_2026_02_23_17_38(symbol);
CREATE INDEX IF NOT EXISTS idx_cms_instruments_category ON public.cms_instruments_2026_02_23_17_38(category);
CREATE INDEX IF NOT EXISTS idx_cms_team_order ON public.cms_team_members_2026_02_23_17_38(order_index);
CREATE INDEX IF NOT EXISTS idx_cms_blog_slug ON public.cms_blog_posts_2026_02_23_17_38(slug);
CREATE INDEX IF NOT EXISTS idx_cms_blog_status ON public.cms_blog_posts_2026_02_23_17_38(status);
CREATE INDEX IF NOT EXISTS idx_cms_blog_published ON public.cms_blog_posts_2026_02_23_17_38(published_at);
CREATE INDEX IF NOT EXISTS idx_cms_faqs_category ON public.cms_faqs_2026_02_23_17_38(category);
CREATE INDEX IF NOT EXISTS idx_cms_settings_key ON public.cms_site_settings_2026_02_23_17_38(setting_key);

-- =============================================
-- 3. TRIGGERS PARA UPDATED_AT
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
CREATE TRIGGER update_cms_page_content_updated_at BEFORE UPDATE ON public.cms_page_content_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_services_updated_at BEFORE UPDATE ON public.cms_services_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_instruments_updated_at BEFORE UPDATE ON public.cms_instruments_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_team_updated_at BEFORE UPDATE ON public.cms_team_members_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_blog_updated_at BEFORE UPDATE ON public.cms_blog_posts_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_faqs_updated_at BEFORE UPDATE ON public.cms_faqs_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_settings_updated_at BEFORE UPDATE ON public.cms_site_settings_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON public.cms_media_files_2026_02_23_17_38 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.cms_page_content_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_services_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_instruments_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_team_members_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_posts_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_site_settings_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media_files_2026_02_23_17_38 ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (contenido visible en el website)
CREATE POLICY "Public read access" ON public.cms_page_content_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_services_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_instruments_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_team_members_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_blog_posts_2026_02_23_17_38 FOR SELECT USING (status = 'published' AND is_active = true);
CREATE POLICY "Public read access" ON public.cms_faqs_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_site_settings_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_media_files_2026_02_23_17_38 FOR SELECT USING (is_active = true);

-- Políticas para administradores (acceso completo)
CREATE POLICY "Admin full access" ON public.cms_page_content_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_services_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_instruments_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_team_members_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_blog_posts_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_faqs_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_site_settings_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Admin full access" ON public.cms_media_files_2026_02_23_17_38 FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.super_admin_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    ) OR
    EXISTS (
        SELECT 1 FROM public.internal_users_2026_02_10 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- =============================================
-- 5. DATOS INICIALES
-- =============================================

-- Insertar servicios iniciales
INSERT INTO public.cms_services_2026_02_23_17_38 (service_id, title, description, icon_name, benefits, order_index) VALUES
('forex-trading', 'Forex Trading', 'Opere con las principales divisas del mundo con spreads desde 0.0 pips y ejecución instantánea.', 'LineChart', ARRAY['Spreads desde 0.0 pips', 'Ejecución en milisegundos', 'Más de 50 pares de divisas', 'Análisis técnico avanzado'], 1),
('commodities', 'Materias Primas', 'Invierta en oro, plata, petróleo y commodities agrícolas con apalancamiento flexible.', 'Briefcase', ARRAY['Oro y metales preciosos', 'Energías (petróleo, gas)', 'Commodities agrícolas', 'Cobertura contra inflación'], 2),
('indices', 'Índices Bursátiles', 'Acceda a los principales índices mundiales: S&P 500, NASDAQ, DAX, FTSE y más.', 'TrendingUp', ARRAY['Índices globales principales', 'Diversificación automática', 'Horarios extendidos', 'Análisis fundamental'], 3),
('crypto', 'Criptomonedas', 'Trade Bitcoin, Ethereum y las principales criptomonedas con tecnología institucional.', 'Zap', ARRAY['Bitcoin y Ethereum', 'Altcoins principales', 'Custodia segura', 'Trading 24/7'], 4)
ON CONFLICT (service_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    benefits = EXCLUDED.benefits,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Insertar FAQs iniciales
INSERT INTO public.cms_faqs_2026_02_23_17_38 (faq_id, question, answer, category, order_index) VALUES
('faq-forex', '¿Qué es el Forex Trading?', 'El mercado de divisas (Forex) es el mercado financiero más grande del mundo, donde se intercambian monedas de diferentes países. Con Pessaro Capital, puede operar EUR/USD, GBP/JPY y más de 50 pares con spreads competitivos desde 0.0 pips.', 'servicios', 1),
('faq-commodities', '¿Cómo invertir en Materias Primas?', 'Las materias primas incluyen metales preciosos (oro, plata), energías (petróleo, gas natural) y productos agrícolas. Son excelentes para diversificar su portafolio y protegerse contra la inflación. Ofrecemos acceso directo con apalancamiento flexible.', 'servicios', 2),
('faq-indices', '¿Qué son los Índices Bursátiles?', 'Los índices representan el rendimiento de un grupo de acciones. Por ejemplo, el S&P 500 incluye las 500 empresas más grandes de EE.UU. Al invertir en índices, obtiene exposición diversificada a mercados completos con una sola operación.', 'servicios', 3),
('faq-crypto', '¿Es seguro invertir en Criptomonedas?', 'Con Pessaro Capital, sus criptomonedas están protegidas por custodia institucional y tecnología de grado bancario. Ofrecemos Bitcoin, Ethereum y las principales altcoins con spreads competitivos y ejecución 24/7.', 'servicios', 4)
ON CONFLICT (faq_id) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    category = EXCLUDED.category,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Insertar configuraciones iniciales del sitio
INSERT INTO public.cms_site_settings_2026_02_23_17_38 (setting_key, setting_value, setting_type, description, category) VALUES
('site_title', 'Pessaro Capital - Trading e Inversiones', 'text', 'Título principal del sitio web', 'general'),
('site_description', 'Plataforma líder en trading de Forex, Commodities, Índices y Criptomonedas con tecnología institucional', 'text', 'Descripción meta del sitio', 'general'),
('contact_email', 'info@pessaro.cl', 'text', 'Email de contacto principal', 'contact'),
('contact_phone', '+56 2 2345 6789', 'text', 'Teléfono de contacto', 'contact'),
('office_address', 'Av. Providencia 1234, Providencia', 'text', 'Dirección de la oficina', 'contact'),
('office_city', 'Santiago, Chile', 'text', 'Ciudad de la oficina', 'contact'),
('trading_hours', '24/5 - Lunes a Viernes', 'text', 'Horarios de trading', 'trading'),
('min_deposit', '100', 'number', 'Depósito mínimo en USD', 'trading'),
('max_leverage', '1:500', 'text', 'Apalancamiento máximo', 'trading')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- Insertar contenido de páginas inicial
INSERT INTO public.cms_page_content_2026_02_23_17_38 (page_slug, section_key, content_type, title, content) VALUES
('home', 'hero_title', 'text', 'Título Hero', 'Domine los Mercados con Precisión Institucional'),
('home', 'hero_subtitle', 'text', 'Subtítulo Hero', 'Acceda a Forex, Commodities e Índices con tecnología de baja latencia y el respaldo de 15 años de excelencia financiera.'),
('home', 'stats_experience', 'text', 'Años de Experiencia', '15+'),
('home', 'stats_assets', 'text', 'Activos Disponibles', '120+'),
('home', 'stats_users', 'text', 'Usuarios Globales', '40M+'),
('home', 'stats_execution', 'text', 'Tiempo de Ejecución', '0.01s'),
('servicios', 'hero_title', 'text', 'Título Servicios', 'Soluciones Financieras de Clase Mundial'),
('servicios', 'hero_description', 'text', 'Descripción Servicios', 'En Pessaro Capital, combinamos tecnología de vanguardia con décadas de experiencia institucional para ofrecerle servicios que transforman su visión financiera en realidad.'),
('nosotros', 'hero_title', 'text', 'Título Nosotros', 'Trayectoria, Confianza y Resultados'),
('nosotros', 'hero_description', 'text', 'Descripción Nosotros', 'Con más de 15 años en los mercados financieros, Pessaro Capital se ha consolidado como un referente en servicios de inversión.')
ON CONFLICT (page_slug, section_key) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    updated_at = NOW();