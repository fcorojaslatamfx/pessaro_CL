-- Crear tabla de perfiles de clientes
CREATE TABLE IF NOT EXISTS public.client_profiles_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    risk_tolerance VARCHAR(50),
    experience_level VARCHAR(50),
    investment_capital VARCHAR(50),
    investment_horizon VARCHAR(50),
    interested_instruments TEXT[],
    investment_goals TEXT[],
    account_status VARCHAR(50) DEFAULT 'active',
    account_type VARCHAR(50) DEFAULT 'standard',
    created_via VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cuentas de trading
CREATE TABLE IF NOT EXISTS public.trading_accounts_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50) DEFAULT 'standard',
    balance DECIMAL(15,2) DEFAULT 0.00,
    equity DECIMAL(15,2) DEFAULT 0.00,
    margin DECIMAL(15,2) DEFAULT 0.00,
    free_margin DECIMAL(15,2) DEFAULT 0.00,
    margin_level DECIMAL(8,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    leverage VARCHAR(20) DEFAULT '1:100',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_type)
);

-- Crear tabla de posiciones de trading (simuladas)
CREATE TABLE IF NOT EXISTS public.trading_positions_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts_2026_02_08_22_02(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    position_type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    lots DECIMAL(10,2) NOT NULL,
    open_price DECIMAL(15,5) NOT NULL,
    current_price DECIMAL(15,5) NOT NULL,
    profit_loss DECIMAL(15,2) DEFAULT 0.00,
    open_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de historial de operaciones
CREATE TABLE IF NOT EXISTS public.trading_history_2026_02_08_22_02 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.trading_accounts_2026_02_08_22_02(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    position_type VARCHAR(10) NOT NULL,
    lots DECIMAL(10,2) NOT NULL,
    open_price DECIMAL(15,5) NOT NULL,
    close_price DECIMAL(15,5) NOT NULL,
    profit_loss DECIMAL(15,2) NOT NULL,
    open_time TIMESTAMP WITH TIME ZONE NOT NULL,
    close_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para actualizar timestamps
CREATE TRIGGER update_client_profiles_updated_at 
    BEFORE UPDATE ON public.client_profiles_2026_02_08_22_02 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_accounts_updated_at 
    BEFORE UPDATE ON public.trading_accounts_2026_02_08_22_02 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_positions_updated_at 
    BEFORE UPDATE ON public.trading_positions_2026_02_08_22_02 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar datos de trading simulados
CREATE OR REPLACE FUNCTION generate_sample_trading_data(p_user_id UUID, p_account_id UUID)
RETURNS VOID AS $$
DECLARE
    symbols TEXT[] := ARRAY['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'Gold', 'Silver', 'Oil'];
    symbol_name TEXT;
    position_type TEXT;
    lots DECIMAL;
    open_price DECIMAL;
    current_price DECIMAL;
    profit_loss DECIMAL;
    i INTEGER;
BEGIN
    -- Generar 3-5 posiciones abiertas aleatorias
    FOR i IN 1..(3 + floor(random() * 3)::int) LOOP
        symbol_name := symbols[1 + floor(random() * array_length(symbols, 1))::int];
        position_type := CASE WHEN random() > 0.5 THEN 'buy' ELSE 'sell' END;
        lots := (0.1 + random() * 2)::DECIMAL(10,2);
        
        -- Precios simulados basados en el símbolo
        CASE symbol_name
            WHEN 'EUR/USD' THEN 
                open_price := (1.08 + random() * 0.02)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
            WHEN 'GBP/USD' THEN 
                open_price := (1.26 + random() * 0.02)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
            WHEN 'USD/JPY' THEN 
                open_price := (148 + random() * 2)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 1)::DECIMAL(15,5);
            WHEN 'Gold' THEN 
                open_price := (2020 + random() * 20)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 10)::DECIMAL(15,5);
            ELSE 
                open_price := (1 + random())::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
        END CASE;
        
        -- Calcular P&L
        IF position_type = 'buy' THEN
            profit_loss := ((current_price - open_price) * lots * 100000)::DECIMAL(15,2);
        ELSE
            profit_loss := ((open_price - current_price) * lots * 100000)::DECIMAL(15,2);
        END IF;
        
        INSERT INTO public.trading_positions_2026_02_08_22_02 (
            user_id, account_id, symbol, position_type, lots, 
            open_price, current_price, profit_loss
        ) VALUES (
            p_user_id, p_account_id, symbol_name, position_type, lots,
            open_price, current_price, profit_loss
        );
    END LOOP;
    
    -- Generar historial de operaciones (5-10 operaciones cerradas)
    FOR i IN 1..(5 + floor(random() * 6)::int) LOOP
        symbol_name := symbols[1 + floor(random() * array_length(symbols, 1))::int];
        position_type := CASE WHEN random() > 0.5 THEN 'buy' ELSE 'sell' END;
        lots := (0.1 + random() * 2)::DECIMAL(10,2);
        
        CASE symbol_name
            WHEN 'EUR/USD' THEN 
                open_price := (1.08 + random() * 0.02)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
            WHEN 'GBP/USD' THEN 
                open_price := (1.26 + random() * 0.02)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
            WHEN 'USD/JPY' THEN 
                open_price := (148 + random() * 2)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 1)::DECIMAL(15,5);
            WHEN 'Gold' THEN 
                open_price := (2020 + random() * 20)::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 10)::DECIMAL(15,5);
            ELSE 
                open_price := (1 + random())::DECIMAL(15,5);
                current_price := (open_price + (random() - 0.5) * 0.01)::DECIMAL(15,5);
        END CASE;
        
        IF position_type = 'buy' THEN
            profit_loss := ((current_price - open_price) * lots * 100000)::DECIMAL(15,2);
        ELSE
            profit_loss := ((open_price - current_price) * lots * 100000)::DECIMAL(15,2);
        END IF;
        
        INSERT INTO public.trading_history_2026_02_08_22_02 (
            user_id, account_id, symbol, position_type, lots, 
            open_price, close_price, profit_loss,
            open_time, close_time
        ) VALUES (
            p_user_id, p_account_id, symbol_name, position_type, lots,
            open_price, current_price, profit_loss,
            NOW() - INTERVAL '1 day' * (random() * 30),
            NOW() - INTERVAL '1 hour' * (random() * 24)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;