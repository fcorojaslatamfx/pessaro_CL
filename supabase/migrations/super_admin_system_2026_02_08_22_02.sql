-- Crear tabla de roles de usuario
CREATE TABLE IF NOT EXISTS public.user_roles_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);

-- Crear tabla de contenido confidencial
CREATE TABLE IF NOT EXISTS public.confidential_content_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_path TEXT,
    description TEXT,
    classification_level VARCHAR(50) DEFAULT 'confidential',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de logs de acceso
CREATE TABLE IF NOT EXISTS public.access_logs_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar timestamps
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles_2026_02_08_22_02 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confidential_content_updated_at 
    BEFORE UPDATE ON public.confidential_content_2026_02_08_22_02 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar contenido confidencial (imagen de credenciales)
INSERT INTO public.confidential_content_2026_02_08_22_02 (
    title,
    content_type,
    file_path,
    description,
    classification_level
) VALUES (
    'Credenciales de Administrador CMS',
    'image/png',
    '/images/Captura de pantalla9101.png',
    'Captura de pantalla con credenciales de acceso al sistema CMS. Contiene email y contraseña de administrador.',
    'top_secret'
);

-- Función para verificar si el usuario es super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles_2026_02_08_22_02 
        WHERE user_id = user_uuid AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar accesos
CREATE OR REPLACE FUNCTION log_access(
    p_user_id UUID,
    p_action VARCHAR(100),
    p_resource_type VARCHAR(100) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.access_logs_2026_02_08_22_02 (
        user_id,
        action,
        resource_type,
        resource_id
    ) VALUES (
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;