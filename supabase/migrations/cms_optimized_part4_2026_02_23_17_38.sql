-- =============================================
-- CMS OPTIMIZADO - PARTE 4: POLÍTICAS RLS
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

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
CREATE POLICY "Public read access" ON public.cms_blog_posts_2026_02_23_17_38 FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON public.cms_faqs_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_site_settings_2026_02_23_17_38 FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.cms_media_files_2026_02_23_17_38 FOR SELECT USING (is_active = true);