-- Función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION check_user_permissions(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    auth_user_record RECORD;
    role_record RECORD;
    result JSON;
BEGIN
    -- Verificar si el usuario existe en auth.users
    SELECT * INTO auth_user_record 
    FROM auth.users 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no encontrado en auth.users',
            'user_email', user_email
        );
    END IF;
    
    -- Verificar si existe en user_profiles
    SELECT * INTO user_record 
    FROM public.user_profiles 
    WHERE email = user_email;
    
    -- Verificar si existe en user_roles_2026_02_08_22_02
    SELECT * INTO role_record 
    FROM public.user_roles_2026_02_08_22_02 
    WHERE user_id = auth_user_record.id;
    
    -- Construir resultado
    result := json_build_object(
        'success', true,
        'user_email', user_email,
        'auth_user_exists', true,
        'auth_user_id', auth_user_record.id,
        'auth_user_confirmed', auth_user_record.email_confirmed_at IS NOT NULL,
        'user_profile_exists', user_record IS NOT NULL,
        'user_role_exists', role_record IS NOT NULL
    );
    
    -- Agregar información del perfil si existe
    IF user_record IS NOT NULL THEN
        result := result || json_build_object(
            'profile_role', user_record.role,
            'profile_active', user_record.is_active,
            'profile_full_name', user_record.full_name,
            'profile_department', user_record.department
        );
    END IF;
    
    -- Agregar información del rol si existe
    IF role_record IS NOT NULL THEN
        result := result || json_build_object(
            'role_table_role', role_record.role,
            'role_permissions', role_record.permissions
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para sincronizar roles entre tablas
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS JSON AS $$
DECLARE
    sync_count INTEGER := 0;
    user_rec RECORD;
    result JSON;
BEGIN
    -- Sincronizar desde user_profiles a user_roles_2026_02_08_22_02
    FOR user_rec IN 
        SELECT up.user_id, up.email, up.role, up.full_name
        FROM public.user_profiles up
        LEFT JOIN public.user_roles_2026_02_08_22_02 ur ON up.user_id = ur.user_id
        WHERE ur.user_id IS NULL AND up.is_active = true
    LOOP
        INSERT INTO public.user_roles_2026_02_08_22_02 (user_id, role, permissions)
        VALUES (
            user_rec.user_id, 
            user_rec.role,
            CASE 
                WHEN user_rec.role = 'super_admin' THEN '{"all": true}'::jsonb
                WHEN user_rec.role = 'admin' THEN '{"cms": true, "users": true, "reports": true}'::jsonb
                WHEN user_rec.role = 'interno' THEN '{"cms": true, "reports": true}'::jsonb
                ELSE '{}'::jsonb
            END
        );
        sync_count := sync_count + 1;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'synced_users', sync_count,
        'message', 'Roles sincronizados correctamente'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear usuario interno completo
CREATE OR REPLACE FUNCTION create_internal_user(
    user_email TEXT,
    user_password TEXT,
    full_name TEXT,
    user_role TEXT DEFAULT 'interno',
    department TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Validar rol
    IF user_role NOT IN ('interno', 'admin', 'super_admin') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Rol inválido. Debe ser: interno, admin, o super_admin'
        );
    END IF;
    
    -- Verificar si el usuario ya existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El usuario ya existe'
        );
    END IF;
    
    -- Crear usuario en auth.users (esto requiere privilegios especiales)
    -- Nota: En producción esto se haría a través de la API de Supabase
    
    -- Por ahora, crear solo los registros en las tablas de perfiles
    -- El usuario debe ser creado manualmente en auth.users primero
    
    RETURN json_build_object(
        'success', false,
        'error', 'Esta función requiere creación manual del usuario en auth.users primero',
        'instructions', 'Use la función create_user_profile después de crear el usuario en auth'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear perfil de usuario después de que existe en auth
CREATE OR REPLACE FUNCTION create_user_profile(
    user_email TEXT,
    full_name TEXT,
    user_role TEXT DEFAULT 'interno',
    department TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    auth_user_id UUID;
    result JSON;
BEGIN
    -- Obtener ID del usuario de auth.users
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no encontrado en auth.users. Debe crearse primero.'
        );
    END IF;
    
    -- Crear perfil en user_profiles
    INSERT INTO public.user_profiles (
        user_id, email, full_name, role, department, is_active
    ) VALUES (
        auth_user_id, user_email, full_name, user_role, department, true
    ) ON CONFLICT (email) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    -- Crear rol en user_roles_2026_02_08_22_02
    INSERT INTO public.user_roles_2026_02_08_22_02 (user_id, role, permissions)
    VALUES (
        auth_user_id, 
        user_role,
        CASE 
            WHEN user_role = 'super_admin' THEN '{"all": true}'::jsonb
            WHEN user_role = 'admin' THEN '{"cms": true, "users": true, "reports": true}'::jsonb
            WHEN user_role = 'interno' THEN '{"cms": true, "reports": true}'::jsonb
            ELSE '{}'::jsonb
        END
    ) ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        updated_at = NOW();
    
    RETURN json_build_object(
        'success', true,
        'message', 'Perfil de usuario creado correctamente',
        'user_id', auth_user_id,
        'email', user_email,
        'role', user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar estado del sistema de acceso
CREATE OR REPLACE FUNCTION check_access_system_status()
RETURNS JSON AS $$
DECLARE
    total_auth_users INTEGER;
    total_profiles INTEGER;
    total_roles INTEGER;
    super_admins INTEGER;
    admins INTEGER;
    internos INTEGER;
    clientes INTEGER;
    result JSON;
BEGIN
    -- Contar usuarios en cada tabla
    SELECT COUNT(*) INTO total_auth_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM public.user_profiles;
    SELECT COUNT(*) INTO total_roles FROM public.user_roles_2026_02_08_22_02;
    
    -- Contar por roles
    SELECT COUNT(*) INTO super_admins FROM public.user_profiles WHERE role = 'super_admin' AND is_active = true;
    SELECT COUNT(*) INTO admins FROM public.user_profiles WHERE role = 'admin' AND is_active = true;
    SELECT COUNT(*) INTO internos FROM public.user_profiles WHERE role = 'interno' AND is_active = true;
    SELECT COUNT(*) INTO clientes FROM public.user_profiles WHERE role = 'cliente' AND is_active = true;
    
    result := json_build_object(
        'success', true,
        'system_status', json_build_object(
            'total_auth_users', total_auth_users,
            'total_profiles', total_profiles,
            'total_roles', total_roles,
            'roles_distribution', json_build_object(
                'super_admins', super_admins,
                'admins', admins,
                'internos', internos,
                'clientes', clientes
            )
        ),
        'recommendations', CASE 
            WHEN super_admins = 0 THEN 'CRÍTICO: No hay super administradores activos'
            WHEN total_profiles != total_roles THEN 'ADVERTENCIA: Desincronización entre perfiles y roles'
            ELSE 'Sistema funcionando correctamente'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;