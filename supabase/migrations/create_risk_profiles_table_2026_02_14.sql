-- Crear tabla de perfiles de riesgo
-- Fecha: 2026-02-14

CREATE TABLE IF NOT EXISTS public.risk_profiles_2026_02_08_21_16 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    risk_tolerance TEXT NOT NULL CHECK (risk_tolerance IN ('conservador', 'moderado', 'agresivo')),
    trading_experience TEXT NOT NULL CHECK (trading_experience IN ('principiante', 'intermedio', 'avanzado', 'experto')),
    investment_capital TEXT NOT NULL,
    investment_horizon TEXT NOT NULL CHECK (investment_horizon IN ('corto_plazo', 'mediano_plazo', 'largo_plazo')),
    interested_instruments TEXT[] DEFAULT '{}',
    investment_goals TEXT[] DEFAULT '{}',
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_risk_profiles_user_id ON public.risk_profiles_2026_02_08_21_16(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_email ON public.risk_profiles_2026_02_08_21_16(email);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_created_at ON public.risk_profiles_2026_02_08_21_16(created_at);

-- Habilitar RLS
ALTER TABLE public.risk_profiles_2026_02_08_21_16 ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios perfiles
CREATE POLICY "Users can view own risk profile" ON public.risk_profiles_2026_02_08_21_16
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan crear su propio perfil
CREATE POLICY "Users can create own risk profile" ON public.risk_profiles_2026_02_08_21_16
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own risk profile" ON public.risk_profiles_2026_02_08_21_16
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para administradores (ver todos los perfiles)
CREATE POLICY "Admins can view all risk profiles" ON public.risk_profiles_2026_02_08_21_16
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin', 'interno')
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_risk_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_risk_profiles_updated_at
    BEFORE UPDATE ON public.risk_profiles_2026_02_08_21_16
    FOR EACH ROW
    EXECUTE FUNCTION update_risk_profile_updated_at();