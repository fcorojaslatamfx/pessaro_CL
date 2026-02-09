-- Función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION check_user_permissions(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  permissions JSON;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO user_role
  FROM user_roles_2026_02_08_22_02
  WHERE user_roles_2026_02_08_22_02.user_id = check_user_permissions.user_id;
  
  IF user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado o sin rol asignado'
    );
  END IF;
  
  -- Definir permisos según rol
  CASE user_role
    WHEN 'super_admin' THEN
      permissions := json_build_object(
        'dashboard_access', true,
        'client_management', true,
        'system_admin', true,
        'reports_access', true,
        'user_management', true
      );
    WHEN 'admin' THEN
      permissions := json_build_object(
        'dashboard_access', true,
        'client_management', true,
        'system_admin', false,
        'reports_access', true,
        'user_management', false
      );
    WHEN 'interno' THEN
      permissions := json_build_object(
        'dashboard_access', true,
        'client_management', false,
        'system_admin', false,
        'reports_access', true,
        'user_management', false
      );
    WHEN 'cliente' THEN
      permissions := json_build_object(
        'dashboard_access', true,
        'client_management', false,
        'system_admin', false,
        'reports_access', false,
        'user_management', false
      );
    ELSE
      permissions := json_build_object(
        'dashboard_access', false,
        'client_management', false,
        'system_admin', false,
        'reports_access', false,
        'user_management', false
      );
  END CASE;
  
  RETURN json_build_object(
    'success', true,
    'user_id', user_id,
    'role', user_role,
    'permissions', permissions
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Función para obtener estadísticas del dashboard según rol
CREATE OR REPLACE FUNCTION get_dashboard_stats(requesting_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  stats JSON;
  client_count INTEGER;
  total_balance DECIMAL;
  active_positions INTEGER;
BEGIN
  -- Verificar rol del usuario
  SELECT role INTO user_role
  FROM user_roles_2026_02_08_22_02
  WHERE user_id = requesting_user_id;
  
  IF user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no autorizado'
    );
  END IF;
  
  -- Obtener estadísticas según el rol
  IF user_role IN ('super_admin', 'admin', 'interno') THEN
    -- Estadísticas completas para usuarios internos
    SELECT COUNT(*) INTO client_count
    FROM client_profiles_2026_02_08_22_02;
    
    SELECT COALESCE(SUM(balance), 0) INTO total_balance
    FROM trading_accounts_2026_02_08_22_02;
    
    SELECT COUNT(*) INTO active_positions
    FROM trading_positions_2026_02_08_22_02
    WHERE status = 'open';
    
    stats := json_build_object(
      'total_clients', client_count,
      'total_balance', total_balance,
      'active_positions', active_positions,
      'access_level', 'internal'
    );
    
  ELSIF user_role = 'cliente' THEN
    -- Estadísticas limitadas para clientes
    SELECT balance INTO total_balance
    FROM trading_accounts_2026_02_08_22_02
    WHERE user_id = requesting_user_id;
    
    SELECT COUNT(*) INTO active_positions
    FROM trading_positions_2026_02_08_22_02
    WHERE user_id = requesting_user_id AND status = 'open';
    
    stats := json_build_object(
      'personal_balance', COALESCE(total_balance, 0),
      'personal_positions', active_positions,
      'access_level', 'client'
    );
    
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Rol no autorizado para acceder al dashboard'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'role', user_role,
    'stats', stats
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Comentarios sobre creación de usuarios de prueba:
-- 1. Crear usuarios en Supabase Auth Dashboard:
--    - admin@pessaro.com / admin123
--    - interno@pessaro.com / interno123  
--    - superadmin@pessaro.com / super123
-- 
-- 2. Luego asignar roles:
--    INSERT INTO user_roles_2026_02_08_22_02 (user_id, role) 
--    VALUES ('[user_id_from_auth]', 'admin');
--
-- 3. Los clientes se crean automáticamente via registro