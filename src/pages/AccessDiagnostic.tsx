import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database,
  UserCheck,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatus {
  total_auth_users: number;
  total_profiles: number;
  total_roles: number;
  roles_distribution: {
    super_admins: number;
    admins: number;
    internos: number;
    clientes: number;
  };
}

interface UserPermissions {
  success: boolean;
  user_email: string;
  auth_user_exists: boolean;
  auth_user_id: string;
  auth_user_confirmed: boolean;
  user_profile_exists: boolean;
  user_role_exists: boolean;
  profile_role?: string;
  profile_active?: boolean;
  profile_full_name?: string;
  profile_department?: string;
  role_table_role?: string;
  role_permissions?: Record<string, any>;
}

const AccessDiagnostic: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailToCheck, setEmailToCheck] = useState('');

  // Cargar estado del sistema al montar
  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('user_access_management_2026_02_09', {
        body: { action: 'system_status' }
      });

      if (error) {
        setError(`Error cargando estado del sistema: ${error.message}`);
        return;
      }

      if (!data.success) {
        setError(`Error: ${data.error}`);
        return;
      }

      setSystemStatus(data.data.system_status);
    } catch (err) {
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermissions = async () => {
    if (!emailToCheck.trim()) {
      setError('Por favor ingresa un email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUserPermissions(null);

      const { data, error } = await supabase.functions.invoke('user_access_management_2026_02_09', {
        body: { 
          action: 'check_access',
          email: emailToCheck.trim()
        }
      });

      if (error) {
        setError(`Error verificando usuario: ${error.message}`);
        return;
      }

      if (!data.success) {
        setError(`Error: ${data.error}`);
        return;
      }

      setUserPermissions(data.data);
    } catch (err) {
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncRoles = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data, error } = await supabase.functions.invoke('user_access_management_2026_02_09', {
        body: { action: 'sync_roles' }
      });

      if (error) {
        setError(`Error sincronizando roles: ${error.message}`);
        return;
      }

      if (!data.success) {
        setError(`Error: ${data.error}`);
        return;
      }

      setSuccess(`Roles sincronizados: ${data.data.synced_users} usuarios actualizados`);
      await loadSystemStatus(); // Recargar estado
    } catch (err) {
      setError(`Error inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRÍTICO': return 'destructive';
      case 'ADVERTENCIA': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Diagnóstico de Acceso</h1>
          </div>
          <p className="text-muted-foreground">
            Herramienta para diagnosticar y corregir problemas de acceso de usuarios
          </p>
        </motion.div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {systemStatus.total_auth_users}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Usuarios Auth
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {systemStatus.total_profiles}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Perfiles
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Distribución de Roles:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex justify-between">
                        <span>Super Admins:</span>
                        <Badge variant={systemStatus.roles_distribution.super_admins > 0 ? 'default' : 'destructive'}>
                          {systemStatus.roles_distribution.super_admins}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Admins:</span>
                        <Badge variant="secondary">
                          {systemStatus.roles_distribution.admins}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Internos:</span>
                        <Badge variant="secondary">
                          {systemStatus.roles_distribution.internos}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Clientes:</span>
                        <Badge variant="outline">
                          {systemStatus.roles_distribution.clientes}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={loadSystemStatus} 
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </Button>
                    <Button 
                      onClick={syncRoles} 
                      disabled={loading}
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Sincronizar Roles
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={loadSystemStatus} disabled={loading}>
                    {loading ? 'Cargando...' : 'Cargar Estado'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verificar Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Verificar Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email del Usuario</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@pessarocapital.com"
                  value={emailToCheck}
                  onChange={(e) => setEmailToCheck(e.target.value)}
                />
              </div>

              <Button 
                onClick={checkUserPermissions} 
                disabled={loading || !emailToCheck.trim()}
                className="w-full"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Verificar Permisos
              </Button>

              {userPermissions && (
                <div className="space-y-3 mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold">Resultado de Verificación:</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {userPermissions.auth_user_exists ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span>Usuario Auth</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {userPermissions.auth_user_confirmed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span>Email Confirmado</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {userPermissions.user_profile_exists ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span>Perfil Existe</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {userPermissions.user_role_exists ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span>Rol Asignado</span>
                    </div>
                  </div>

                  {userPermissions.profile_full_name && (
                    <div className="space-y-1">
                      <div><strong>Nombre:</strong> {userPermissions.profile_full_name}</div>
                      <div><strong>Rol:</strong> {userPermissions.profile_role}</div>
                      {userPermissions.profile_department && (
                        <div><strong>Departamento:</strong> {userPermissions.profile_department}</div>
                      )}
                      <div>
                        <strong>Estado:</strong> 
                        <Badge variant={userPermissions.profile_active ? 'default' : 'destructive'} className="ml-2">
                          {userPermissions.profile_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">1. Verificar Sistema</h4>
                <p className="text-sm text-muted-foreground">
                  Revisa el estado general del sistema de acceso y la distribución de roles.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">2. Verificar Usuario</h4>
                <p className="text-sm text-muted-foreground">
                  Ingresa un email para verificar el estado de acceso de un usuario específico.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">3. Sincronizar Roles</h4>
                <p className="text-sm text-muted-foreground">
                  Sincroniza los roles entre las tablas user_profiles y user_roles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessDiagnostic;