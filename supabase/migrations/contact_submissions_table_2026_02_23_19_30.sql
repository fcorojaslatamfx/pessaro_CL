-- =============================================
-- TABLA CONTACT SUBMISSIONS - POPUPS
-- Fecha: 2026-02-23 19:30 UTC
-- =============================================

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    investment_capital NUMERIC DEFAULT 0,
    management_type TEXT,
    comments TEXT,
    form_type TEXT DEFAULT 'popup',
    button_type TEXT DEFAULT 'contact',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_form_type ON public.contact_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_button_type ON public.contact_submissions(button_type);

-- Habilitar RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (solo para administradores)
CREATE POLICY "contact_submissions_read_admin" ON public.contact_submissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para inserción pública (cualquiera puede enviar contacto)
CREATE POLICY "contact_submissions_insert_public" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger si no existe
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();