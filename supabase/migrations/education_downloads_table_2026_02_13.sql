-- Crear tabla para registrar descargas de contenido educativo
CREATE TABLE IF NOT EXISTS public.education_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('rutas', 'base-conocimientos', 'faq')),
    content_title VARCHAR(500) NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_education_downloads_email ON public.education_downloads(email);
CREATE INDEX IF NOT EXISTS idx_education_downloads_content_type ON public.education_downloads(content_type);
CREATE INDEX IF NOT EXISTS idx_education_downloads_downloaded_at ON public.education_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_education_downloads_created_at ON public.education_downloads(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.education_downloads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública (para registrar descargas)
CREATE POLICY "Allow public insert on education_downloads" ON public.education_downloads
    FOR INSERT 
    WITH CHECK (true);

-- Política para que solo usuarios internos y admin puedan ver las descargas
CREATE POLICY "Allow internal users to view education_downloads" ON public.education_downloads
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.user_roles_2026_02_08_22_02 ur ON up.id = ur.user_id
            WHERE up.id = auth.uid()
            AND ur.role IN ('interno', 'admin', 'super_admin')
            AND ur.is_active = true
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_education_downloads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_update_education_downloads_updated_at
    BEFORE UPDATE ON public.education_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_education_downloads_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.education_downloads IS 'Registro de descargas de contenido educativo';
COMMENT ON COLUMN public.education_downloads.id IS 'Identificador único de la descarga';
COMMENT ON COLUMN public.education_downloads.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN public.education_downloads.phone IS 'Número de teléfono móvil';
COMMENT ON COLUMN public.education_downloads.email IS 'Correo electrónico';
COMMENT ON COLUMN public.education_downloads.content_type IS 'Tipo de contenido descargado';
COMMENT ON COLUMN public.education_downloads.content_title IS 'Título del contenido descargado';
COMMENT ON COLUMN public.education_downloads.downloaded_at IS 'Fecha y hora de la descarga';
COMMENT ON COLUMN public.education_downloads.ip_address IS 'Dirección IP del usuario';
COMMENT ON COLUMN public.education_downloads.user_agent IS 'User agent del navegador';