-- =============================================
-- CMS Database Setup for Pessaro Capital
-- Created: 2026-01-30 20:41 UTC
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USER PROFILES AND ROLES
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles_2026_01_30_20_41 (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CONTENT MANAGEMENT TABLES
-- =============================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES public.user_profiles_2026_01_30_20_41(id),
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_time INTEGER DEFAULT 5,
    views INTEGER DEFAULT 0
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members_2026_01_30_20_41 (
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

-- Services table
CREATE TABLE IF NOT EXISTS public.services_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    icon_name TEXT DEFAULT 'Globe',
    benefits TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading instruments table
CREATE TABLE IF NOT EXISTS public.trading_instruments_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    spread TEXT NOT NULL,
    leverage TEXT NOT NULL,
    trending TEXT DEFAULT 'neutral' CHECK (trending IN ('up', 'down', 'neutral')),
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages content table (for editable page sections)
CREATE TABLE IF NOT EXISTS public.page_content_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_slug TEXT NOT NULL,
    section_key TEXT NOT NULL,
    title TEXT,
    content TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_slug, section_key)
);

-- =============================================
-- 3. MEDIA MANAGEMENT
-- =============================================

-- Media library table
CREATE TABLE IF NOT EXISTS public.media_library_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES public.user_profiles_2026_01_30_20_41(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. SYSTEM SETTINGS
-- =============================================

-- Site settings table
CREATE TABLE IF NOT EXISTS public.site_settings_2026_01_30_20_41 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. INDEXES FOR PERFORMANCE
-- =============================================

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts_2026_01_30_20_41(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts_2026_01_30_20_41(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts_2026_01_30_20_41(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts_2026_01_30_20_41(slug);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members_2026_01_30_20_41(is_active);
CREATE INDEX IF NOT EXISTS idx_team_members_order ON public.team_members_2026_01_30_20_41(order_index);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services_2026_01_30_20_41(is_active);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services_2026_01_30_20_41(order_index);

-- Trading instruments indexes
CREATE INDEX IF NOT EXISTS idx_instruments_active ON public.trading_instruments_2026_01_30_20_41(is_active);
CREATE INDEX IF NOT EXISTS idx_instruments_category ON public.trading_instruments_2026_01_30_20_41(category);
CREATE INDEX IF NOT EXISTS idx_instruments_popular ON public.trading_instruments_2026_01_30_20_41(is_popular);

-- Page content indexes
CREATE INDEX IF NOT EXISTS idx_page_content_page_slug ON public.page_content_2026_01_30_20_41(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_content_active ON public.page_content_2026_01_30_20_41(is_active);

-- =============================================
-- 6. INITIAL DATA SEEDING
-- =============================================

-- Insert default site settings
INSERT INTO public.site_settings_2026_01_30_20_41 (setting_key, setting_value, setting_type, description) VALUES
('site_title', 'Pessaro Capital', 'text', 'Site title'),
('site_description', 'Plataforma líder de trading e inversión', 'text', 'Site description'),
('contact_email', 'contacto@pessarocapital.com', 'text', 'Contact email'),
('contact_phone', '+56 9 22 07 15 11', 'text', 'Contact phone'),
('contact_address', 'Avenida Apoquindo 6410, Las Condes, Santiago', 'text', 'Contact address'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode toggle')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert current team members
INSERT INTO public.team_members_2026_01_30_20_41 (name, role, bio, linkedin_url, order_index) VALUES
('Francisco Rojas-Aranda', 'Fundador & Director Ejecutivo', 'Con más de 20 años en el sector bancario internacional, Francisco fundó Pessaro Capital con la visión de democratizar el acceso a mercados de alto rendimiento.', 'https://www.linkedin.com/in/francisco-rojas-/', 1),
('Team Senior', 'Equipo Matriz Chile', 'Nuestro equipo matriz ubicado en Chile coordina las operaciones regionales y supervisa la estrategia de expansión en mercados latinoamericanos, garantizando el más alto nivel de servicio.', 'https://www.linkedin.com/company/pessarocapital/?viewAsMember=true', 2),
('Partnership', 'Integración de Socios', 'Nuestro departamento de partnerships se encarga de establecer y mantener alianzas estratégicas con brokers, instituciones financieras y proveedores de tecnología para ampliar nuestro ecosistema de servicios.', 'https://www.linkedin.com/company/pessarocapital/?viewAsMember=true', 3)
ON CONFLICT DO NOTHING;

-- Insert current services
INSERT INTO public.services_2026_01_30_20_41 (title, description, long_description, icon_name, benefits, order_index) VALUES
('Forex Trading', 'Opere con más de 60 pares de divisas con spreads desde 0.0 pips y ejecución instantánea.', 'Acceda al mercado de divisas más líquido del mundo con condiciones institucionales. Spreads competitivos, apalancamiento flexible y tecnología de última generación.', 'TrendingUp', ARRAY['Spreads desde 0.0 pips en EUR/USD', 'Apalancamiento hasta 1:500', 'Ejecución en menos de 30ms', 'Sin comisiones ocultas'], 1),
('Materias Primas', 'Invierta en oro, plata, petróleo y productos agrícolas con márgenes competitivos.', 'Diversifique su cartera con materias primas, el activo refugio por excelencia. Acceso directo a mercados globales con condiciones preferenciales.', 'Coins', ARRAY['Oro y plata sin comisiones', 'Petróleo WTI y Brent', 'Productos agrícolas globales', 'Cobertura contra inflación'], 2),
('Índices Bursátiles', 'Opere con los principales índices mundiales: S&P 500, NASDAQ, DAX, FTSE y más.', 'Capture las tendencias de los mercados globales operando con los índices más representativos. Exposición diversificada con un solo instrumento.', 'BarChart3', ARRAY['S&P 500, NASDAQ, Dow Jones', 'Índices europeos y asiáticos', 'Spreads fijos garantizados', 'Horarios extendidos de trading'], 3),
('Criptomonedas', 'Bitcoin, Ethereum y las principales altcoins con apalancamiento y sin custodia.', 'Entre en el futuro de las finanzas con criptomonedas. Trading 24/7 con las mejores condiciones del mercado y sin necesidad de wallet.', 'Zap', ARRAY['Bitcoin, Ethereum, Litecoin', 'Trading 24/7 sin interrupciones', 'Sin custodia de activos', 'Apalancamiento hasta 1:10'], 4)
ON CONFLICT DO NOTHING;

-- Insert current trading instruments
INSERT INTO public.trading_instruments_2026_01_30_20_41 (symbol, name, category, spread, leverage, trending, is_popular) VALUES
('EUR/USD', 'Euro vs Dólar', 'Forex', '0.0', '1:500', 'up', true),
('GBP/USD', 'Libra vs Dólar', 'Forex', '0.1', '1:500', 'down', false),
('USD/JPY', 'Dólar vs Yen', 'Forex', '0.1', '1:500', 'up', false),
('XAU/USD', 'Oro', 'Commodities', '0.3', '1:100', 'up', true),
('WTI', 'Petróleo WTI', 'Commodities', '0.05', '1:100', 'neutral', false),
('SPX500', 'S&P 500', 'Indices', '0.4', '1:100', 'up', true),
('NAS100', 'NASDAQ 100', 'Indices', '1.0', '1:100', 'up', false),
('BTC/USD', 'Bitcoin', 'Commodities', '50', '1:10', 'up', true),
('ETH/USD', 'Ethereum', 'Commodities', '2.5', '1:10', 'neutral', false)
ON CONFLICT (symbol) DO NOTHING;