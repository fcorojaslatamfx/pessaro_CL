-- Crear usuarios internos para dashboard
-- Nota: Los usuarios deben registrarse primero en Supabase Auth, luego se les asignarán los roles

-- Insertar perfiles de usuarios internos
INSERT INTO public.user_profiles (
    id,
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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

-- Crear función para obtener información de usuarios internos
CREATE OR REPLACE FUNCTION get_internal_users()
RETURNS TABLE (
    email TEXT,
    full_name TEXT,
    role TEXT,
    department TEXT,
    is_active BOOLEAN,
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
        up.created_at
    FROM public.user_profiles up
    WHERE up.role IN ('interno', 'admin', 'super_admin')
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para validar acceso al dashboard
CREATE OR REPLACE FUNCTION validate_dashboard_access(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_info RECORD;
    result JSON;
BEGIN
    -- Buscar usuario en perfiles
    SELECT 
        email,
        full_name,
        role,
        department,
        is_active
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
COMMENT ON FUNCTION get_internal_users() IS 'Obtiene lista de todos los usuarios internos del sistema';
COMMENT ON FUNCTION validate_dashboard_access(TEXT) IS 'Valida si un usuario tiene acceso al dashboard interno';

-- Mostrar usuarios creados
SELECT 
    email,
    full_name,
    role,
    department,
    'Acceso al Dashboard Interno' as access_level
FROM public.user_profiles 
WHERE email IN (
    'mario@pessarocapital.com',
    'juan.pablo@pessarocapital.com', 
    'ivan@pessarocapital.com',
    'daniel@pessarocapital.com'
);