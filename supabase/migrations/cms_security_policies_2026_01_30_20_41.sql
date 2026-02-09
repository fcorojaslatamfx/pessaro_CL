-- =============================================
-- CMS Row Level Security (RLS) Policies
-- Created: 2026-01-30 20:41 UTC
-- =============================================

-- =============================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.user_profiles_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_instruments_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings_2026_01_30_20_41 ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. USER PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles_2026_01_30_20_41
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles_2026_01_30_20_41
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles_2026_01_30_20_41
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 3. BLOG POSTS POLICIES
-- =============================================

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts_2026_01_30_20_41
    FOR SELECT USING (status = 'published');

-- Authenticated users with editor/admin role can view all posts
CREATE POLICY "Editors can view all posts" ON public.blog_posts_2026_01_30_20_41
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can insert posts
CREATE POLICY "Editors can insert posts" ON public.blog_posts_2026_01_30_20_41
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Authors can update their own posts, admins can update any
CREATE POLICY "Authors can update own posts" ON public.blog_posts_2026_01_30_20_41
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            author_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Only admins can delete posts
CREATE POLICY "Admins can delete posts" ON public.blog_posts_2026_01_30_20_41
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 4. TEAM MEMBERS POLICIES
-- =============================================

-- Anyone can view active team members
CREATE POLICY "Anyone can view active team members" ON public.team_members_2026_01_30_20_41
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all team members
CREATE POLICY "Authenticated users can view all team members" ON public.team_members_2026_01_30_20_41
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify team members
CREATE POLICY "Admins can modify team members" ON public.team_members_2026_01_30_20_41
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 5. SERVICES POLICIES
-- =============================================

-- Anyone can view active services
CREATE POLICY "Anyone can view active services" ON public.services_2026_01_30_20_41
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all services
CREATE POLICY "Authenticated users can view all services" ON public.services_2026_01_30_20_41
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify services
CREATE POLICY "Admins can modify services" ON public.services_2026_01_30_20_41
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 6. TRADING INSTRUMENTS POLICIES
-- =============================================

-- Anyone can view active instruments
CREATE POLICY "Anyone can view active instruments" ON public.trading_instruments_2026_01_30_20_41
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all instruments
CREATE POLICY "Authenticated users can view all instruments" ON public.trading_instruments_2026_01_30_20_41
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify instruments
CREATE POLICY "Admins can modify instruments" ON public.trading_instruments_2026_01_30_20_41
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 7. PAGE CONTENT POLICIES
-- =============================================

-- Anyone can view active page content
CREATE POLICY "Anyone can view active page content" ON public.page_content_2026_01_30_20_41
    FOR SELECT USING (is_active = true);

-- Authenticated users can view all page content
CREATE POLICY "Authenticated users can view all page content" ON public.page_content_2026_01_30_20_41
    FOR SELECT USING (auth.role() = 'authenticated');

-- Editors and admins can modify page content
CREATE POLICY "Editors can modify page content" ON public.page_content_2026_01_30_20_41
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- =============================================
-- 8. MEDIA LIBRARY POLICIES
-- =============================================

-- Authenticated users can view media
CREATE POLICY "Authenticated users can view media" ON public.media_library_2026_01_30_20_41
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media_library_2026_01_30_20_41
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own uploads, admins can delete any
CREATE POLICY "Users can delete own uploads" ON public.media_library_2026_01_30_20_41
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            uploaded_by = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- =============================================
-- 9. SITE SETTINGS POLICIES
-- =============================================

-- Anyone can view site settings
CREATE POLICY "Anyone can view site settings" ON public.site_settings_2026_01_30_20_41
    FOR SELECT USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can modify site settings" ON public.site_settings_2026_01_30_20_41
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- 10. FUNCTIONS FOR USER MANAGEMENT
-- =============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_2026_01_30_20_41()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles_2026_01_30_20_41 (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        CASE 
            WHEN NEW.email = 'admin@pessarocapital.com' THEN 'admin'
            ELSE 'viewer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_2026_01_30_20_41 ON auth.users;
CREATE TRIGGER on_auth_user_created_2026_01_30_20_41
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_2026_01_30_20_41();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column_2026_01_30_20_41()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.user_profiles_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_blog_posts_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.blog_posts_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_team_members_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.team_members_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_services_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.services_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_trading_instruments_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.trading_instruments_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_page_content_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.page_content_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();

CREATE TRIGGER update_site_settings_updated_at_2026_01_30_20_41
    BEFORE UPDATE ON public.site_settings_2026_01_30_20_41
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_2026_01_30_20_41();