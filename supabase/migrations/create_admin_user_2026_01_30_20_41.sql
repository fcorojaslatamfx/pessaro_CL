-- =============================================
-- Create Admin User for CMS
-- Created: 2026-01-30 20:41 UTC
-- Email: admin@pessarocapital.com
-- Password: @2026Pessaro
-- =============================================

-- Insert admin user into auth.users table
-- Note: In Supabase, users are typically created through the Auth API
-- This SQL creates the user record directly in the database

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users (this might need to be done through Supabase Auth API)
    -- For now, we'll create the profile record that will be linked when user signs up
    
    -- Check if admin profile already exists
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
        WHERE email = 'admin@pessarocapital.com'
    ) THEN
        -- Insert admin profile record
        INSERT INTO public.user_profiles_2026_01_30_20_41 (
            id,
            email,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'admin@pessarocapital.com',
            'Administrador Pessaro Capital',
            'admin',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin profile created with ID: %', admin_user_id;
    ELSE
        -- Update existing profile to admin role
        UPDATE public.user_profiles_2026_01_30_20_41 
        SET 
            role = 'admin',
            full_name = 'Administrador Pessaro Capital',
            updated_at = NOW()
        WHERE email = 'admin@pessarocapital.com';
        
        RAISE NOTICE 'Existing profile updated to admin role';
    END IF;
END $$;

-- =============================================
-- Create additional admin functions
-- =============================================

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin_2026_01_30_20_41(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_profiles_2026_01_30_20_41 
    SET 
        role = 'admin',
        updated_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_2026_01_30_20_41(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.promote_to_admin_2026_01_30_20_41(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_2026_01_30_20_41(UUID) TO authenticated;

-- =============================================
-- Insert sample data for testing
-- =============================================

-- Insert some sample blog posts for the admin to manage
INSERT INTO public.blog_posts_2026_01_30_20_41 (
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    status,
    published_at,
    read_time
) VALUES 
(
    'Bienvenido al CMS de Pessaro Capital',
    'bienvenido-cms-pessaro-capital',
    'Guía completa para usar el nuevo sistema de gestión de contenido de Pessaro Capital.',
    '<h2>¡Bienvenido al CMS!</h2><p>Este es tu nuevo sistema de gestión de contenido. Aquí podrás:</p><ul><li>Crear y editar artículos del blog</li><li>Gestionar el equipo</li><li>Actualizar servicios</li><li>Administrar instrumentos de trading</li><li>Subir y organizar medios</li></ul><p>¡Comienza explorando las diferentes secciones del panel!</p>',
    'CMS',
    ARRAY['tutorial', 'cms', 'guía'],
    'published',
    NOW(),
    3
),
(
    'Cómo Usar el Editor de Contenido',
    'como-usar-editor-contenido',
    'Aprende a usar el editor de texto enriquecido para crear contenido profesional.',
    '<h2>Editor de Texto Enriquecido</h2><p>El editor incluye todas las herramientas necesarias:</p><ul><li><strong>Formato de texto</strong>: Negrita, cursiva, subrayado</li><li><strong>Listas</strong>: Numeradas y con viñetas</li><li><strong>Enlaces</strong>: Internos y externos</li><li><strong>Imágenes</strong>: Upload directo desde el editor</li></ul><p>¡Experimenta con todas las opciones disponibles!</p>',
    'Tutorial',
    ARRAY['editor', 'tutorial', 'contenido'],
    'draft',
    NULL,
    5
) ON CONFLICT (slug) DO NOTHING;

-- Update the trigger function to handle admin email specifically
CREATE OR REPLACE FUNCTION public.handle_new_user_2026_01_30_20_41()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles_2026_01_30_20_41 (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 
                CASE 
                    WHEN NEW.email = 'admin@pessarocapital.com' THEN 'Administrador Pessaro Capital'
                    ELSE NEW.email
                END),
        CASE 
            WHEN NEW.email = 'admin@pessarocapital.com' THEN 'admin'
            WHEN NEW.email LIKE '%@pessarocapital.com' THEN 'editor'
            ELSE 'viewer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Show admin user info
SELECT 
    'Admin user profile ready' as status,
    email,
    full_name,
    role,
    created_at
FROM public.user_profiles_2026_01_30_20_41 
WHERE email = 'admin@pessarocapital.com';