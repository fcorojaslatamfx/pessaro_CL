import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VerificationResult {
  status: string;
  timestamp: string;
  vercel: {
    project_id: string;
    integration: string;
    domains: string[];
  };
  supabase: {
    connection: string;
    url: string;
  };
  resend: {
    api_status: string;
    email_delivery: string;
    from_email: string;
    to_email: string;
  };
  database: {
    write_test: string;
    tables: string[];
  };
  environment: Record<string, string>;
  errors: string[];
  summary: {
    total_checks: number;
    passed: number;
    overall_status: string;
  };
}

const IntegrationVerificationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 Iniciando verificación de integración...');
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'integration_verification_complete_2026_02_25_21_00',
        {
          body: { 
            test_type: 'full_integration',
            timestamp: new Date().toISOString()
          }
        }
      );

      if (functionError) {
        throw new Error(`Error en Edge Function: ${functionError.message}`);
      }

      if (data) {
        setResult(data);
        console.log('✅ Verificación completada:', data);
      } else {
        throw new Error('No se recibieron datos de la verificación');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error en verificación:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.includes('❌')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.includes('⚠️')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('✅')) return <Badge variant="default" className="bg-green-500">Operativo</Badge>;
    if (status.includes('❌')) return <Badge variant="destructive">Error</Badge>;
    if (status.includes('⚠️')) return <Badge variant="secondary">Advertencia</Badge>;
    return <Badge variant="outline">Desconocido</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            🔍 Verificación de Integración Completa
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verifica que la integración entre Vercel (ID: prj_drLletG9P9E6QLwlDeOFSWYcDZSs), 
            Supabase y Resend esté funcionando correctamente para el envío de correos y formularios.
          </p>
          
          <Button 
            onClick={runVerification} 
            disabled={isLoading}
            size="lg"
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Ejecutar Verificación
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <XCircle className="mr-2 h-5 w-5" />
                Error en Verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>📊 Resumen General</span>
                  {getStatusBadge(result.summary.overall_status)}
                </CardTitle>
                <CardDescription>
                  Verificación completada el {new Date(result.timestamp).toLocaleString('es-CL')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.summary.passed}</div>
                    <div className="text-sm text-muted-foreground">Pruebas Exitosas</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.summary.total_checks}</div>
                    <div className="text-sm text-muted-foreground">Total de Pruebas</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.errors.length}</div>
                    <div className="text-sm text-muted-foreground">Errores Encontrados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vercel Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(result.vercel.integration)}
                  <span className="ml-2">🌐 Integración con Vercel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Project ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{result.vercel.project_id}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estado:</span>
                  {getStatusBadge(result.vercel.integration)}
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Dominios Configurados:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.vercel.domains.map((domain, index) => (
                      <Badge key={index} variant="outline">{domain}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supabase Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(result.supabase.connection)}
                  <span className="ml-2">🗄️ Conexión Supabase</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Conexión:</span>
                  {getStatusBadge(result.supabase.connection)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">URL Configurada:</span>
                  {getStatusBadge(result.supabase.url)}
                </div>
              </CardContent>
            </Card>

            {/* Resend Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(result.resend.api_status)}
                  <span className="ml-2">📧 Sistema de Correos (Resend)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">API Status:</span>
                  {getStatusBadge(result.resend.api_status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Entrega de Correos:</span>
                  {getStatusBadge(result.resend.email_delivery)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">From Email:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{result.resend.from_email}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">To Email:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{result.resend.to_email}</code>
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(result.database.write_test)}
                  <span className="ml-2">💾 Base de Datos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Prueba de Escritura:</span>
                  {getStatusBadge(result.database.write_test)}
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Tablas Verificadas:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.database.tables.map((table, index) => (
                      <Badge key={index} variant="outline">{table}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Variables de Entorno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(result.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="font-medium">{key}:</span>
                      {getStatusBadge(value)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <XCircle className="mr-2 h-5 w-5" />
                    Errores Encontrados ({result.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-red-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">📋 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-600 space-y-2">
            <p>• Esta verificación prueba la integración completa entre Vercel, Supabase y Resend.</p>
            <p>• Se enviará un correo de prueba a <strong>info@pessaro.cl</strong> para verificar la entrega.</p>
            <p>• Los datos de prueba se insertan y eliminan automáticamente de la base de datos.</p>
            <p>• Si hay errores, revisa la configuración de las variables de entorno en Supabase.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationVerificationPage;