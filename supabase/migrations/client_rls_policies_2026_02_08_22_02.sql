-- Habilitar RLS en todas las tablas de clientes
ALTER TABLE public.client_profiles_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_positions_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_history_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;

-- Políticas para client_profiles_2026_02_08_22_02
-- Los usuarios pueden ver y modificar solo su propio perfil
CREATE POLICY "users_can_view_own_profile" ON public.client_profiles_2026_02_08_22_02
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_profile" ON public.client_profiles_2026_02_08_22_02
    FOR UPDATE USING (auth.uid() = user_id);

-- Super admins pueden ver todos los perfiles
CREATE POLICY "super_admin_can_view_all_profiles" ON public.client_profiles_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Sistema puede insertar perfiles (para registro automático)
CREATE POLICY "system_can_insert_profiles" ON public.client_profiles_2026_02_08_22_02
    FOR INSERT WITH CHECK (true);

-- Políticas para trading_accounts_2026_02_08_22_02
-- Los usuarios pueden ver solo sus propias cuentas
CREATE POLICY "users_can_view_own_accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR UPDATE USING (auth.uid() = user_id);

-- Super admins pueden ver todas las cuentas
CREATE POLICY "super_admin_can_view_all_accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Sistema puede insertar cuentas
CREATE POLICY "system_can_insert_accounts" ON public.trading_accounts_2026_02_08_22_02
    FOR INSERT WITH CHECK (true);

-- Políticas para trading_positions_2026_02_08_22_02
-- Los usuarios pueden ver solo sus propias posiciones
CREATE POLICY "users_can_view_own_positions" ON public.trading_positions_2026_02_08_22_02
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_manage_own_positions" ON public.trading_positions_2026_02_08_22_02
    FOR ALL USING (auth.uid() = user_id);

-- Super admins pueden ver todas las posiciones
CREATE POLICY "super_admin_can_view_all_positions" ON public.trading_positions_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Sistema puede insertar posiciones
CREATE POLICY "system_can_insert_positions" ON public.trading_positions_2026_02_08_22_02
    FOR INSERT WITH CHECK (true);

-- Políticas para trading_history_2026_02_08_22_02
-- Los usuarios pueden ver solo su propio historial
CREATE POLICY "users_can_view_own_history" ON public.trading_history_2026_02_08_22_02
    FOR SELECT USING (auth.uid() = user_id);

-- Super admins pueden ver todo el historial
CREATE POLICY "super_admin_can_view_all_history" ON public.trading_history_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Sistema puede insertar historial
CREATE POLICY "system_can_insert_history" ON public.trading_history_2026_02_08_22_02
    FOR INSERT WITH CHECK (true);

-- Función para obtener datos del cliente autenticado
CREATE OR REPLACE FUNCTION get_client_data(client_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    client_profile RECORD;
    trading_account RECORD;
    result JSON;
BEGIN
    -- Si no se especifica user_id, usar el usuario autenticado
    target_user_id := COALESCE(client_user_id, auth.uid());
    
    -- Verificar que el usuario puede acceder a estos datos
    IF target_user_id != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.user_roles_2026_02_08_22_02 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    ) THEN
        RETURN json_build_object('error', 'Acceso denegado');
    END IF;
    
    -- Obtener perfil del cliente
    SELECT * INTO client_profile 
    FROM public.client_profiles_2026_02_08_22_02 
    WHERE user_id = target_user_id;
    
    -- Obtener cuenta de trading
    SELECT * INTO trading_account 
    FROM public.trading_accounts_2026_02_08_22_02 
    WHERE user_id = target_user_id AND account_type = 'standard';
    
    -- Construir resultado
    result := json_build_object(
        'profile', row_to_json(client_profile),
        'account', row_to_json(trading_account),
        'success', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener posiciones abiertas del cliente
CREATE OR REPLACE FUNCTION get_client_positions(client_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    positions_data JSON;
BEGIN
    target_user_id := COALESCE(client_user_id, auth.uid());
    
    -- Verificar permisos
    IF target_user_id != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.user_roles_2026_02_08_22_02 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    ) THEN
        RETURN json_build_object('error', 'Acceso denegado');
    END IF;
    
    -- Obtener posiciones abiertas
    SELECT json_agg(row_to_json(p)) INTO positions_data
    FROM public.trading_positions_2026_02_08_22_02 p
    WHERE p.user_id = target_user_id AND p.status = 'open'
    ORDER BY p.open_time DESC;
    
    RETURN json_build_object(
        'positions', COALESCE(positions_data, '[]'::json),
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener historial de trading del cliente
CREATE OR REPLACE FUNCTION get_client_history(client_user_id UUID DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    history_data JSON;
BEGIN
    target_user_id := COALESCE(client_user_id, auth.uid());
    
    -- Verificar permisos
    IF target_user_id != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.user_roles_2026_02_08_22_02 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    ) THEN
        RETURN json_build_object('error', 'Acceso denegado');
    END IF;
    
    -- Obtener historial
    SELECT json_agg(row_to_json(h)) INTO history_data
    FROM (
        SELECT * FROM public.trading_history_2026_02_08_22_02 
        WHERE user_id = target_user_id 
        ORDER BY close_time DESC 
        LIMIT limit_count
    ) h;
    
    RETURN json_build_object(
        'history', COALESCE(history_data, '[]'::json),
        'success', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;