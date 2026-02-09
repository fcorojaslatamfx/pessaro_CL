-- =============================================
-- CMS Storage Configuration
-- Created: 2026-01-30 20:41 UTC
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKETS
-- =============================================

-- Create bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-images-2026-01-30-20-41',
    'blog-images-2026-01-30-20-41',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for team member photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'team-photos-2026-01-30-20-41',
    'team-photos-2026-01-30-20-41',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for general media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media-library-2026-01-30-20-41',
    'media-library-2026-01-30-20-41',
    true,
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. STORAGE POLICIES
-- =============================================

-- Blog images policies
CREATE POLICY "Anyone can view blog images" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog-images-2026-01-30-20-41');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'blog-images-2026-01-30-20-41' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own blog images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'blog-images-2026-01-30-20-41' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own blog images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'blog-images-2026-01-30-20-41' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Team photos policies
CREATE POLICY "Anyone can view team photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'team-photos-2026-01-30-20-41');

CREATE POLICY "Admins can manage team photos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'team-photos-2026-01-30-20-41' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Media library policies
CREATE POLICY "Anyone can view media library" ON storage.objects
    FOR SELECT USING (bucket_id = 'media-library-2026-01-30-20-41');

CREATE POLICY "Authenticated users can upload to media library" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'media-library-2026-01-30-20-41' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can manage their own media" ON storage.objects
    FOR ALL USING (
        bucket_id = 'media-library-2026-01-30-20-41' AND (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.user_profiles_2026_01_30_20_41 
                WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- =============================================
-- 3. HELPER FUNCTIONS FOR STORAGE
-- =============================================

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION public.generate_unique_filename_2026_01_30_20_41(
    original_name TEXT,
    user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT AS $$
DECLARE
    extension TEXT;
    base_name TEXT;
    unique_name TEXT;
BEGIN
    -- Extract file extension
    extension := LOWER(SUBSTRING(original_name FROM '\.([^.]*)$'));
    base_name := SUBSTRING(original_name FROM '^(.*)\.([^.]*)$');
    
    -- Generate unique filename with timestamp
    unique_name := user_id::TEXT || '/' || 
                   EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || 
                   REPLACE(LOWER(base_name), ' ', '_') || 
                   CASE WHEN extension IS NOT NULL THEN '.' || extension ELSE '' END;
    
    RETURN unique_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_files_2026_01_30_20_41()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- This function would be called periodically to clean up files
    -- that are no longer referenced in the database
    
    -- For now, just return 0 as a placeholder
    -- In a real implementation, you would:
    -- 1. Find storage objects not referenced in media_library table
    -- 2. Delete them from storage
    -- 3. Return the count of deleted files
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. STORAGE TRIGGERS
-- =============================================

-- Function to update media library when file is uploaded
CREATE OR REPLACE FUNCTION public.handle_storage_upload_2026_01_30_20_41()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert record into media library when file is uploaded
    INSERT INTO public.media_library_2026_01_30_20_41 (
        filename,
        original_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by
    ) VALUES (
        NEW.name,
        COALESCE(NEW.metadata->>'original_name', NEW.name),
        NEW.bucket_id || '/' || NEW.name,
        (NEW.metadata->>'size')::INTEGER,
        NEW.metadata->>'mimetype',
        auth.uid()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for storage uploads (if supported by Supabase)
-- Note: This might need to be implemented differently depending on Supabase version
-- CREATE TRIGGER on_storage_upload_2026_01_30_20_41
--     AFTER INSERT ON storage.objects
--     FOR EACH ROW EXECUTE FUNCTION public.handle_storage_upload_2026_01_30_20_41();