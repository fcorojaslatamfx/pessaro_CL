-- Agregar el dominio personalizado de Resend como secreto
-- Nota: Este comando debe ejecutarse desde la consola de Supabase o CLI
-- INSERT INTO vault.secrets (name, secret) VALUES ('RESEND_DOMAIN', 'send.pessarocapital.com');

-- Verificar secretos existentes
SELECT name, created_at, updated_at 
FROM vault.secrets 
WHERE name IN ('RESEND_API_KEY', 'RESEND_DOMAIN')
ORDER BY name;