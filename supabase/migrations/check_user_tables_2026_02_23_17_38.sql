-- Verificar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%admin%' OR table_name LIKE '%user%' OR table_name LIKE '%internal%'
ORDER BY table_name;