-- =============================================
-- Call Edge Function to Create Admin User
-- Created: 2026-01-30 20:41 UTC
-- =============================================

-- This SQL will call the Edge Function to create the admin user
-- Since we can't directly call Edge Functions from SQL, we'll prepare the data

-- First, let's ensure our trigger function is properly set up
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

-- Recreate the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created_2026_01_30_20_41 ON auth.users;
CREATE TRIGGER on_auth_user_created_2026_01_30_20_41
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_2026_01_30_20_41();

-- Create a function to check admin status
CREATE OR REPLACE FUNCTION public.check_admin_setup_2026_01_30_20_41()
RETURNS TABLE (
    status TEXT,
    message TEXT,
    admin_exists BOOLEAN,
    edge_function_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'ready'::TEXT as status,
        'Admin user setup is ready. Use the Edge Function to create the user.'::TEXT as message,
        EXISTS(
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE email = 'admin@pessarocapital.com' AND role = 'admin'
        ) as admin_exists,
        'https://ldlflxujrjihiybrcree.supabase.co/functions/v1/create_admin_user_2026_01_30_20_41'::TEXT as edge_function_url;
END;
$$ LANGUAGE plpgsql;

-- Check current status
SELECT * FROM public.check_admin_setup_2026_01_30_20_41();

-- Insert sample content for the admin to manage
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

-- Show final status
SELECT 
    'Setup Complete' as status,
    'Ready to create admin user via Edge Function' as message,
    'POST to: https://ldlflxujrjihiybrcree.supabase.co/functions/v1/create_admin_user_2026_01_30_20_41' as instruction,
    '{"email": "admin@pessarocapital.com", "password": "@2026Pessaro", "full_name": "Administrador Pessaro Capital"}' as payload;