-- Crear tabla de cuentas de trading
-- Fecha: 2026-02-14

CREATE TABLE IF NOT EXISTS public.trading_accounts_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN ('demo', 'real')),
    account_number TEXT UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CLP')),
    leverage TEXT DEFAULT '1:100',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generar número de cuenta automáticamente
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_number IS NULL THEN
        NEW.account_number := CASE 
            WHEN NEW.account_type = 'demo' THEN 'DEMO' || LPAD(nextval('demo_account_seq')::TEXT, 6, '0')
            ELSE 'REAL' || LPAD(nextval('real_account_seq')::TEXT, 6, '0')
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear secuencias para números de cuenta
CREATE SEQUENCE IF NOT EXISTS demo_account_seq START 100001;
CREATE SEQUENCE IF NOT EXISTS real_account_seq START 200001;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts_2026_02_08_22_02(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_account_number ON public.trading_accounts_2026_02_08_22_02(account_number);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON public.trading_accounts_2026_02_08_22_02(status);

-- Habilitar RLS
ALTER TABLE public.trading_accounts_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own trading accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trading accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trading accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trading accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin', 'interno')
        )
    );

-- Trigger para generar número de cuenta
CREATE TRIGGER generate_trading_account_number
    BEFORE INSERT ON public.trading_accounts_2026_02_08_22_02
    FOR EACH ROW
    EXECUTE FUNCTION generate_account_number();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_trading_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_trading_accounts_updated_at
    BEFORE UPDATE ON public.trading_accounts_2026_02_08_22_02
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_account_updated_at();