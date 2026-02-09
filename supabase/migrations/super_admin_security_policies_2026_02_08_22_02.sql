-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_roles_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confidential_content_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs_2026_02_08_22_02 ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles_2026_02_08_22_02
-- Solo super admins pueden ver y modificar roles
CREATE POLICY "super_admin_can_view_all_roles" ON public.user_roles_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "super_admin_can_insert_roles" ON public.user_roles_2026_02_08_22_02
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "super_admin_can_update_roles" ON public.user_roles_2026_02_08_22_02
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "super_admin_can_delete_roles" ON public.user_roles_2026_02_08_22_02
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Políticas para confidential_content_2026_02_08_22_02
-- Solo super admins pueden acceder a contenido confidencial
CREATE POLICY "super_admin_can_view_confidential" ON public.confidential_content_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "super_admin_can_manage_confidential" ON public.confidential_content_2026_02_08_22_02
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Políticas para access_logs_2026_02_08_22_02
-- Solo super admins pueden ver logs, todos pueden insertar (para auditoría)
CREATE POLICY "super_admin_can_view_logs" ON public.access_logs_2026_02_08_22_02
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles_2026_02_08_22_02 ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

CREATE POLICY "authenticated_can_insert_logs" ON public.access_logs_2026_02_08_22_02
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Función para crear el super administrador inicial
CREATE OR REPLACE FUNCTION create_super_admin(
    admin_email TEXT,
    admin_password TEXT
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    -- Esta función debe ser ejecutada por un administrador de Supabase
    -- No se puede crear usuarios desde SQL directamente por seguridad
    
    -- Retornar instrucciones para crear el usuario manualmente
    result := json_build_object(
        'success', false,
        'message', 'El super administrador debe ser creado manualmente desde el panel de Supabase Auth',
        'instructions', json_build_object(
            'email', admin_email,
            'password', admin_password,
            'role', 'super_admin',
            'next_step', 'Después de crear el usuario, ejecutar: SELECT assign_super_admin_role(''user_id_here'');'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para asignar rol de super admin a un usuario existente
CREATE OR REPLACE FUNCTION assign_super_admin_role(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Insertar o actualizar el rol del usuario
    INSERT INTO public.user_roles_2026_02_08_22_02 (
        user_id,
        role,
        permissions,
        created_by
    ) VALUES (
        target_user_id,
        'super_admin',
        '{"access_level": "full", "can_modify_roles": true, "can_view_confidential": true, "can_view_logs": true}',
        target_user_id
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin',
        permissions = '{"access_level": "full", "can_modify_roles": true, "can_view_confidential": true, "can_view_logs": true}',
        updated_at = NOW();
    
    -- Registrar la acción
    PERFORM log_access(
        target_user_id,
        'SUPER_ADMIN_ROLE_ASSIGNED',
        'user_roles',
        target_user_id
    );
    
    result := json_build_object(
        'success', true,
        'message', 'Rol de super administrador asignado correctamente',
        'user_id', target_user_id,
        'role', 'super_admin'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;