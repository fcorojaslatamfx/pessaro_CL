-- =============================================
-- CMS OPTIMIZADO - PARTE 5: POLÍTICAS ADMIN
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

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