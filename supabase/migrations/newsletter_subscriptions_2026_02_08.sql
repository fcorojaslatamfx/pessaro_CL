-- Crear tabla para suscripciones de newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    topics TEXT[] DEFAULT '{}',
    source VARCHAR(100) DEFAULT 'website',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_topics ON public.newsletter_subscriptions USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscriptions(subscribed_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_newsletter_updated_at ON public.newsletter_subscriptions;
CREATE TRIGGER trigger_newsletter_updated_at
    BEFORE UPDATE ON public.newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública (suscripciones)
CREATE POLICY "Allow public newsletter subscription" ON public.newsletter_subscriptions
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir lectura solo a usuarios autenticados (admin)
CREATE POLICY "Allow authenticated read newsletter" ON public.newsletter_subscriptions
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política para permitir actualización solo a usuarios autenticados (admin)
CREATE POLICY "Allow authenticated update newsletter" ON public.newsletter_subscriptions
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Función para obtener estadísticas de suscripciones
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_subscriptions', (
            SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = true
        ),
        'total_unsubscribed', (
            SELECT COUNT(*) FROM public.newsletter_subscriptions WHERE is_active = false
        ),
        'topics_popularity', (
            SELECT json_object_agg(topic, count)
            FROM (
                SELECT unnest(topics) as topic, COUNT(*) as count
                FROM public.newsletter_subscriptions 
                WHERE is_active = true
                GROUP BY topic
                ORDER BY count DESC
            ) t
        ),
        'recent_subscriptions', (
            SELECT COUNT(*) 
            FROM public.newsletter_subscriptions 
            WHERE is_active = true 
            AND subscribed_at >= NOW() - INTERVAL '30 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE public.newsletter_subscriptions IS 'Tabla para almacenar suscripciones al newsletter con temas personalizados';
COMMENT ON COLUMN public.newsletter_subscriptions.topics IS 'Array de temas de interés: noticias, politica, mercados, acciones, divisas, etf, criptomonedas';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Origen de la suscripción: newsletter_popup, footer, blog, etc.';
COMMENT ON FUNCTION get_newsletter_stats() IS 'Función para obtener estadísticas de suscripciones para el dashboard';