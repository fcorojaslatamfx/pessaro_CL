-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cliente' CHECK (role IN ('cliente', 'interno', 'admin', 'super_admin')),
    department VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Política para permitir inserción de perfiles (para registro)
CREATE POLICY "Allow profile creation" ON public.user_profiles
    FOR INSERT 
    WITH CHECK (true);

-- Política para que usuarios internos puedan ver otros perfiles internos
CREATE POLICY "Internal users can view internal profiles" ON public.user_profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('interno', 'admin', 'super_admin')
            AND up.is_active = true
        )
    );

-- Insertar perfiles de usuarios internos (sin user_id por ahora, se actualizará cuando se registren)
INSERT INTO public.user_profiles (
    email,
    full_name,
    role,
    department,
    is_active,
    created_at,
    updated_at
) VALUES 
-- Mario Fatigante
(
    'mario@pessarocapital.com',
    'Mario Fatigante',
    'interno',
    'Business Development',
    true,
    NOW(),
    NOW()
),
-- Juan Pablo Alberio  
(
    'juan.pablo@pessarocapital.com',
    'Juan Pablo Alberio',
    'interno',
    'Business Development',
    true,
    NOW(),
    NOW()
),
-- Iván Serrano
(
    'ivan@pessarocapital.com',
    'Iván Serrano',
    'interno',
    'Business Development',
    true,
    NOW(),
    NOW()
),
-- Daniel Malpartida
(
    'daniel@pessarocapital.com',
    'Daniel Malpartida',
    'interno',
    'Business Development',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Función para sincronizar perfil con auth.users cuando se registre
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar perfil existente con user_id cuando el usuario se registre
    UPDATE public.user_profiles 
    SET 
        user_id = NEW.id,
        updated_at = NOW()
    WHERE email = NEW.email AND user_id IS NULL;
    
    -- Si no existe perfil, crear uno básico
    IF NOT FOUND THEN
        INSERT INTO public.user_profiles (user_id, email, full_name, role)
        VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 'cliente');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar perfiles cuando se crea un usuario en auth
DROP TRIGGER IF EXISTS trigger_sync_user_profile ON auth.users;
CREATE TRIGGER trigger_sync_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_profile();

-- Función para obtener información de usuarios internos
CREATE OR REPLACE FUNCTION get_internal_users()
RETURNS TABLE (
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    is_active BOOLEAN,
    has_registered BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.email,
        up.full_name,
        up.role,
        up.department,
        up.is_active,
        (up.user_id IS NOT NULL) as has_registered,
        up.created_at
    FROM public.user_profiles up
    WHERE up.role IN ('interno', 'admin', 'super_admin')
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar acceso al dashboard
CREATE OR REPLACE FUNCTION validate_dashboard_access(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_info RECORD;
BEGIN
    -- Buscar usuario en perfiles
    SELECT 
        email,
        full_name,
        role,
        department,
        is_active,
        user_id
    INTO user_info
    FROM public.user_profiles
    WHERE email = user_email AND is_active = true;
    
    IF user_info IS NULL THEN
        RETURN json_build_object(
            'has_access', false,
            'message', 'Usuario no encontrado o inactivo'
        );
    END IF;
    
    -- Verificar si tiene rol de acceso interno
    IF user_info.role NOT IN ('interno', 'admin', 'super_admin') THEN
        RETURN json_build_object(
            'has_access', false,
            'message', 'Sin permisos de acceso al dashboard'
        );
    END IF;
    
    -- Usuario válido
    RETURN json_build_object(
        'has_access', true,
        'registered', (user_info.user_id IS NOT NULL),
        'user', json_build_object(
            'email', user_info.email,
            'full_name', user_info.full_name,
            'role', user_info.role,
            'department', user_info.department
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario con roles y información adicional';
COMMENT ON FUNCTION get_internal_users() IS 'Obtiene lista de todos los usuarios internos del sistema';
COMMENT ON FUNCTION validate_dashboard_access(TEXT) IS 'Valida si un usuario tiene acceso al dashboard interno';

-- Mostrar usuarios internos creados
SELECT 
    email,
    full_name,
    role,
    department,
    CASE 
        WHEN user_id IS NOT NULL THEN 'Registrado'
        ELSE 'Pendiente de registro'
    END as status,
    'Dashboard Interno - Business Development Manager' as access_level
FROM public.user_profiles 
WHERE email IN (
    'mario@pessarocapital.com',
    'juan.pablo@pessarocapital.com', 
    'ivan@pessarocapital.com',
    'daniel@pessarocapital.com'
);