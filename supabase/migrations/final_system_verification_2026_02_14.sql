-- Verificación final del sistema completo
-- Fecha: 2026-02-14

-- 1. Contar registros en tablas principales
SELECT 'user_profiles' as tabla, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'user_roles_2026_02_08_22_02' as tabla, COUNT(*) as registros FROM user_roles_2026_02_08_22_02
UNION ALL
SELECT 'access_logs_2026_02_08_22_02' as tabla, COUNT(*) as registros FROM access_logs_2026_02_08_22_02
UNION ALL
SELECT 'risk_profiles_2026_02_08_21_16' as tabla, COUNT(*) as registros FROM risk_profiles_2026_02_08_21_16
UNION ALL
SELECT 'trading_accounts_2026_02_08_22_02' as tabla, COUNT(*) as registros FROM trading_accounts_2026_02_08_22_02
UNION ALL
SELECT 'newsletter_subscriptions_2026_02_08' as tabla, COUNT(*) as registros FROM newsletter_subscriptions_2026_02_08;

-- 2. Verificar roles existentes
SELECT 
    role,
    COUNT(*) as usuarios_con_rol
FROM user_roles_2026_02_08_22_02 
GROUP BY role
ORDER BY role;

-- 3. Verificar que RLS esté habilitado en tablas críticas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_profiles', 
    'user_roles_2026_02_08_22_02', 
    'access_logs_2026_02_08_22_02',
    'risk_profiles_2026_02_08_21_16',
    'trading_accounts_2026_02_08_22_02'
)
ORDER BY tablename;

-- 4. Verificar políticas RLS críticas
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_profiles', 
    'user_roles_2026_02_08_22_02',
    'risk_profiles_2026_02_08_21_16'
)
ORDER BY tablename, policyname;