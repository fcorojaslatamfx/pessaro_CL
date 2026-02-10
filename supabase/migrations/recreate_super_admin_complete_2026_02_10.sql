-- Recrear Super Admin Completamente - 2026-02-10
-- Este script elimina cualquier super admin existente y crea uno nuevo con cambio obligatorio de contraseña

-- 1. Eliminar super admin existente si existe
DO $$
DECLARE
    existing_super_admin_id UUID;
BEGIN
    -- Buscar super admin existente
    SELECT user_id INTO existing_super_admin_id
    FROM user_roles_2026_02_08_22_02
    WHERE role = 'super_admin'
    LIMIT 1;
    
    -- Si existe, eliminarlo completamente
    IF existing_super_admin_id IS NOT NULL THEN
        -- Eliminar de user_roles
        DELETE FROM user_roles_2026_02_08_22_02 WHERE user_id = existing_super_admin_id;
        
        -- Eliminar de user_profiles
        DELETE FROM user_profiles WHERE user_id = existing_super_admin_id;
        
        -- Eliminar de access_logs
        DELETE FROM access_logs_2026_02_08_22_02 WHERE user_id = existing_super_admin_id;
        
        RAISE NOTICE 'Super admin existente eliminado: %', existing_super_admin_id;
    ELSE
        RAISE NOTICE 'No se encontró super admin existente';
    END IF;
END $$;

-- 2. Función para crear super admin con contraseña temporal
CREATE OR REPLACE FUNCTION create_super_admin_with_temp_password()
RETURNS JSON AS $$
DECLARE
    result JSON;
    temp_user_id UUID;
    admin_email TEXT := 'admin@pessarocapital.com';
    temp_password TEXT := '@PessaroAdmin2026!';
BEGIN
    -- Generar UUID para el usuario
    temp_user_id := gen_random_uuid();
    
    -- Crear perfil de usuario con first_login_completed = false
    INSERT INTO user_profiles (
        user_id,
        full_name,
        email,
        role,
        department,
        is_active,
        first_login_completed,
        password_changed_at,
        created_at,
        updated_at
    ) VALUES (
        temp_user_id,
        'Super Administrador',
        admin_email,
        'super_admin',
        'Administración',
        true,
        false, -- Requiere cambio de contraseña
        NULL,
        NOW(),
        NOW()
    );
    
    -- Crear rol de super admin
    INSERT INTO user_roles_2026_02_08_22_02 (
        user_id,
        role,
        permissions,
        created_at,
        updated_at
    ) VALUES (
        temp_user_id,
        'super_admin',
        jsonb_build_object(
            'all', true,
            'super_admin', true,
            'user_management', true,
            'system_settings', true,
            'access_logs', true,
            'confidential_content', true
        ),
        NOW(),
        NOW()
    );
    
    -- Registrar la creación en logs
    INSERT INTO access_logs_2026_02_08_22_02 (
        user_id,
        action,
        resource_type,
        details,
        created_at
    ) VALUES (
        temp_user_id,
        'SUPER_ADMIN_CREATED_SQL',
        'authentication',
        'Super admin created via SQL with temporary password',
        NOW()
    );
    
    -- Retornar resultado
    result := json_build_object(
        'success', true,
        'message', 'Super admin creado exitosamente en base de datos',
        'user_id', temp_user_id,
        'email', admin_email,
        'temporary_password', temp_password,
        'requires_password_change', true,
        'instructions', 'Use la Edge Function para crear el usuario en auth.users'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error creando super admin: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ejecutar la función para crear el super admin
SELECT create_super_admin_with_temp_password();

-- 4. Función para verificar el estado del super admin
CREATE OR REPLACE FUNCTION check_super_admin_status()
RETURNS JSON AS $$
DECLARE
    result JSON;
    admin_count INTEGER;
    admin_info RECORD;
BEGIN
    -- Contar super admins
    SELECT COUNT(*) INTO admin_count
    FROM user_roles_2026_02_08_22_02
    WHERE role = 'super_admin';
    
    IF admin_count = 0 THEN
        result := json_build_object(
            'success', true,
            'super_admin_exists', false,
            'count', 0,
            'message', 'No hay super administradores en el sistema'
        );
    ELSE
        -- Obtener información del super admin
        SELECT 
            ur.user_id,
            up.email,
            up.full_name,
            up.is_active,
            up.first_login_completed,
            up.password_changed_at,
            ur.created_at
        INTO admin_info
        FROM user_roles_2026_02_08_22_02 ur
        JOIN user_profiles up ON ur.user_id = up.user_id
        WHERE ur.role = 'super_admin'
        LIMIT 1;
        
        result := json_build_object(
            'success', true,
            'super_admin_exists', true,
            'count', admin_count,
            'admin_info', json_build_object(
                'user_id', admin_info.user_id,
                'email', admin_info.email,
                'full_name', admin_info.full_name,
                'is_active', admin_info.is_active,
                'first_login_completed', admin_info.first_login_completed,
                'password_changed_at', admin_info.password_changed_at,
                'created_at', admin_info.created_at,
                'requires_password_change', NOT COALESCE(admin_info.first_login_completed, false)
            )
        );
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error verificando estado del super admin: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verificar el estado actual
SELECT check_super_admin_status();

-- 6. Función para marcar el primer login como completado
CREATE OR REPLACE FUNCTION mark_first_login_completed(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Actualizar el perfil
    UPDATE user_profiles
    SET 
        first_login_completed = true,
        password_changed_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Verificar si se actualizó
    IF FOUND THEN
        -- Registrar en logs
        INSERT INTO access_logs_2026_02_08_22_02 (
            user_id,
            action,
            resource_type,
            details,
            created_at
        ) VALUES (
            p_user_id,
            'FIRST_LOGIN_COMPLETED',
            'authentication',
            'First login completed and password changed',
            NOW()
        );
        
        result := json_build_object(
            'success', true,
            'message', 'Primer login marcado como completado'
        );
    ELSE
        result := json_build_object(
            'success', false,
            'error', 'Usuario no encontrado'
        );
    END IF;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error marcando primer login: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Mostrar resumen final
SELECT 
    'SUPER ADMIN RECREADO EXITOSAMENTE' as status,
    'admin@pessarocapital.com' as email,
    '@PessaroAdmin2026!' as temporary_password,
    'true' as requires_password_change,
    'Use la Edge Function super_admin_complete_2026_02_10 para completar la creación' as next_step;