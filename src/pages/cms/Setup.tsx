import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CMSSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create_admin_user_2026_01_30_20_41', {
        method: 'GET'
      });

      if (error) throw error;

      setAdminExists(data.admin_exists);
    } catch (err) {
      console.error('Error checking admin:', err);
    }
  };

  const createAdminUser = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('create_admin_user_2026_01_30_20_41', {
        body: {
          email: 'admin@pessarocapital.com',
          password: '@2026Pessaro',
          full_name: 'Administrador Pessaro Capital'
        }
      });

      if (error) throw error;

      if (data.success) {
        setMessage('Usuario administrador creado exitosamente');
        setAdminExists(true);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError(err.message || 'Error al crear el usuario administrador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuración CMS</CardTitle>
          <CardDescription>
            Pessaro Capital - Sistema de Gestión de Contenido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {adminExists ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                El usuario administrador ya existe. Puedes acceder al CMS.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Es necesario crear el usuario administrador para acceder al CMS.
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> admin@pessarocapital.com</p>
              <p><strong>Contraseña:</strong> @2026Pessaro</p>
            </div>

            {!adminExists && (
              <Button 
                onClick={createAdminUser} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario Administrador
              </Button>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/cms/login'}
            >
              Ir al CMS
            </Button>

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Volver al Sitio Web
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}