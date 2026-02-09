-- Verificar usuarios internos creados
SELECT 
    email,
    full_name,
    role,
    department,
    is_active,
    CASE 
        WHEN user_id IS NOT NULL THEN 'Registrado en Auth'
        ELSE 'Pendiente de registro'
    END as auth_status,
    created_at,
    updated_at
FROM public.user_profiles 
WHERE role = 'interno'
ORDER BY created_at DESC;

-- Estadísticas de usuarios por rol
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_users
FROM public.user_profiles 
GROUP BY role
ORDER BY total_users DESC;

-- Verificar función de validación de acceso
SELECT validate_dashboard_access('mario@pessarocapital.com') as mario_access;
SELECT validate_dashboard_access('juan.pablo@pessarocapital.com') as juan_pablo_access;
SELECT validate_dashboard_access('ivan@pessarocapital.com') as ivan_access;
SELECT validate_dashboard_access('daniel@pessarocapital.com') as daniel_access;