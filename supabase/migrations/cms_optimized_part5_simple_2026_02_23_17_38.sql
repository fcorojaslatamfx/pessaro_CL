-- =============================================
-- CMS OPTIMIZADO - PARTE 5: POLÍTICAS ADMIN SIMPLIFICADAS
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

-- Políticas para administradores (acceso completo para usuarios autenticados)
CREATE POLICY "Admin full access" ON public.cms_page_content_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_services_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_instruments_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_team_members_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_blog_posts_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_faqs_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_site_settings_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin full access" ON public.cms_media_files_2026_02_23_17_38 FOR ALL USING (auth.uid() IS NOT NULL);