-- Listar todas las tablas existentes en el esquema public
-- Fecha: 2026-02-14

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;