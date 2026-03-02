-- =============================================
-- TABLA NEWSLETTER SUBSCRIPTIONS
-- Fecha: 2026-02-23 19:30 UTC
-- =============================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    topics TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscriptions(subscribed_at);

-- Habilitar RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (solo para administradores)
CREATE POLICY "newsletter_read_admin" ON public.newsletter_subscriptions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para inserción pública (cualquiera puede suscribirse)
CREATE POLICY "newsletter_insert_public" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Política para actualización pública (para desuscribirse)
CREATE POLICY "newsletter_update_public" ON public.newsletter_subscriptions
    FOR UPDATE USING (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_newsletter_subscriptions_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON public.newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();