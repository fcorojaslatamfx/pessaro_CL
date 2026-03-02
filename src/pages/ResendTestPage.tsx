import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, Send, Loader2 } from 'lucide-react';
import { testResendIntegration, testFormsIntegration, testPasswordRecovery, runAllEmailTests } from '@/utils/emailTests';

const ResendTestPage: React.FC = () => {
  const [testEmail, setTestEmail] = useState('info@pessaro.cl');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleTestResend = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await testResendIntegration(testEmail);
      setResults({ type: 'resend', data: result });
    } catch (error) {
      setResults({ type: 'resend', data: { success: false, error: 'Error ejecutando test' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestForms = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await testFormsIntegration();
      setResults({ type: 'forms', data: result });
    } catch (error) {
      setResults({ type: 'forms', data: { success: false, error: 'Error ejecutando test' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPasswordRecovery = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await testPasswordRecovery(testEmail);
      setResults({ type: 'password', data: result });
    } catch (error) {
      setResults({ type: 'password', data: { success: false, error: 'Error ejecutando test' } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const result = await runAllEmailTests();
      setResults({ type: 'all', data: result });
    } catch (error) {
      setResults({ type: 'all', data: { success: false, error: 'Error ejecutando tests' } });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const { type, data } = results;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Resultados del Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={data.success ? "default" : "destructive"}>
                {data.success ? "ÉXITO" : "ERROR"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Tipo: {type}
              </span>
            </div>

            {data.message && (
              <Alert>
                <AlertDescription>{data.message}</AlertDescription>
              </Alert>
            )}

            {data.error && (
              <Alert variant="destructive">
                <AlertDescription>{data.error}</AlertDescription>
              </Alert>
            )}

            {data.details && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Detalles:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(data.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test de Integración Resend API</h1>
        <p className="text-muted-foreground">
          Verifica que la integración con Resend API esté funcionando correctamente para el envío de emails.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuración de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email de Prueba:</label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se enviará un email de prueba a esta dirección
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tests Individuales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Tests Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTestResend}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Resend API
            </Button>

            <Button
              onClick={handleTestForms}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Formularios
            </Button>

            <Button
              onClick={handleTestPasswordRecovery}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Recuperación
            </Button>

            <Button
              onClick={handleRunAllTests}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Ejecutar Todos los Tests
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información del Sistema */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estado del Sistema de Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Resend API</h4>
              <Badge variant="default" className="mt-2">Configurado</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                API Key disponible en Supabase
              </p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Edge Functions</h4>
              <Badge variant="default" className="mt-2">Desplegadas</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                3 funciones activas
              </p>
            </div>

            <div className="text-center p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Base de Datos</h4>
              <Badge variant="default" className="mt-2">Operativa</Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Tablas y políticas configuradas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {renderResults()}

      {/* Información Adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Edge Function de Test:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                resend_integration_test_2026_02_23_19_45
              </code>
            </div>
            <div className="flex justify-between">
              <span>Edge Function de Formularios:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                unified_forms_handler_2026_02_23_19_35
              </code>
            </div>
            <div className="flex justify-between">
              <span>Edge Function de Recuperación:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                password_recovery_fixed_2026_02_23_19_30
              </code>
            </div>
            <div className="flex justify-between">
              <span>Email por defecto:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                onboarding@resend.dev
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendTestPage;