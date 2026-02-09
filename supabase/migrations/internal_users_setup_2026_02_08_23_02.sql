-- Crear usuarios internos de prueba para el dashboard
-- Estos usuarios ya deben existir en Supabase Auth, aquí solo agregamos sus roles

-- Usuario interno de prueba
INSERT INTO user_roles_2026_02_08_22_02 (user_id, role) 
VALUES 
  -- Reemplazar con IDs reales de usuarios creados en Supabase Auth
  ('00000000-0000-0000-0000-000000000001', 'interno'),
  ('00000000-0000-0000-0000-000000000002', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'super_admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Función para crear usuario interno completo (Auth + Role)
CREATE OR REPLACE FUNCTION create_internal_user(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT DEFAULT 'interno'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Nota: En producción, los usuarios se crearían a través de Supabase Auth
  -- Esta función es solo para documentar el proceso
  
  -- Simular creación de usuario (en realidad se hace via Auth)
  new_user_id := gen_random_uuid();
  
  -- Insertar rol del usuario
  INSERT INTO user_roles_2026_02_08_22_02 (user_id, role)
  VALUES (new_user_id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  
  -- Registrar en logs
  INSERT INTO access_logs_2026_02_08_22_02 (user_id, action, details)
  VALUES (new_user_id, 'internal_user_created', 
          json_build_object('email', user_email, 'role', user_role));
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'role', user_role,
    'message', 'Usuario interno creado exitosamente'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Error creando usuario interno'
  );
END;
$$;

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

-- Comentarios sobre usuarios de prueba
-- Para crear usuarios reales, usar Supabase Auth Dashboard o API:
-- 1. admin@pessaro.com / admin123 (rol: admin)
-- 2. interno@pessaro.com / interno123 (rol: interno)  
-- 3. superadmin@pessaro.com / super123 (rol: super_admin)

-- Luego ejecutar:
-- INSERT INTO user_roles_2026_02_08_22_02 (user_id, role) VALUES ('[user_id_from_auth]', 'admin');