-- =============================================
-- CMS OPTIMIZADO - PARTE 7: CONFIGURACIONES Y CONTENIDO
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

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