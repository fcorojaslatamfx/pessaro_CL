-- =============================================
-- CMS OPTIMIZADO - PARTE 3: ÍNDICES, TRIGGERS, RLS
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

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