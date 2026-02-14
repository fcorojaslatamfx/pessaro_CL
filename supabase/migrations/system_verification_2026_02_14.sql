-- Verificación completa del sistema de tablas, roles y permisos
-- Fecha: 2026-02-14

-- 1. Verificar estructura de user_profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Verificar estructura de user_roles_2026_02_08_22_02
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles_2026_02_08_22_02' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de access_logs_2026_02_08_22_02
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'access_logs_2026_02_08_22_02' 
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_roles_2026_02_08_22_02', 'access_logs_2026_02_08_22_02')
ORDER BY tablename, policyname;

-- 5. Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'user_roles_2026_02_08_22_02', 'access_logs_2026_02_08_22_02');

-- 6. Contar registros en tablas principales
SELECT 'user_profiles' as tabla, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'user_roles_2026_02_08_22_02' as tabla, COUNT(*) as registros FROM user_roles_2026_02_08_22_02
UNION ALL
SELECT 'access_logs_2026_02_08_22_02' as tabla, COUNT(*) as registros FROM access_logs_2026_02_08_22_02
UNION ALL
SELECT 'risk_profiles_2026_02_08_21_16' as tabla, COUNT(*) as registros FROM risk_profiles_2026_02_08_21_16
UNION ALL
SELECT 'newsletter_subscriptions_2026_02_08' as tabla, COUNT(*) as registros FROM newsletter_subscriptions_2026_02_08;

-- 7. Verificar roles existentes
SELECT 
    role,
    COUNT(*) as usuarios_con_rol
FROM user_roles_2026_02_08_22_02 
GROUP BY role
ORDER BY role;