import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestResend: React.FC = () => {
  const [testEmail, setTestEmail] = useState('info@pessaro.cl');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testResendAPI = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Iniciando test de Resend API...');
      
      const { data, error } = await supabase.functions.invoke('resend_integration_test_2026_02_23_19_45', {
        body: { testEmail }
      });

      if (error) {
        setResult({ success: false, error: error.message, details: error });
        return;
      }

      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: 'Error durante la ejecución del test', details: err });
    } finally {
      setIsLoading(false);
    }
  };

  const testContactForm = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'popup',
          formData: {
            fullName: 'Test Usuario',
            email: testEmail,
            mobile: '+56912345678',
            investmentCapital: 10000,
            managementType: 'PAAM',
            comments: 'Test de integración',
            buttonType: 'account'
          }
        }
      });

      if (error) {
        setResult({ success: false, error: error.message, type: 'contact_form' });
        return;
      }

      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: 'Error durante el test de formulario', details: err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
            🧪 Test de Resend API - Pessaro Capital
          </h1>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Configuración de Prueba</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Prueba:
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@ejemplo.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Se enviará un email de prueba a esta dirección
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testResendAPI}
              disabled={isLoading}
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Probando...' : '🧪 Test Resend API'}
            </button>

            <button
              onClick={testContactForm}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Probando...' : '📧 Test Formulario'}
            </button>
          </div>

          {result && (
            <div className={`p-4 rounded-lg mb-6 ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <h4 className="font-semibold mb-2">
                {result.success ? '✅ ÉXITO' : '❌ ERROR'}
              </h4>
              
              {result.message && (
                <p className="mb-2">
                  <strong>Mensaje:</strong> {result.message}
                </p>
              )}
              
              {result.error && (
                <p className="mb-2">
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              
              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">
                    Ver Detalles Técnicos
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">
              ℹ️ Estado del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <h5 className="font-medium text-blue-900">Resend API</h5>
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mt-2">
                  Configurado ✅
                </span>
                <p className="text-xs text-gray-600 mt-2">API Key en Supabase</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h5 className="font-medium text-blue-900">Edge Functions</h5>
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mt-2">
                  Desplegadas ✅
                </span>
                <p className="text-xs text-gray-600 mt-2">3 funciones activas</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h5 className="font-medium text-blue-900">Email Principal</h5>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                  info@pessaro.cl
                </span>
                <p className="text-xs text-gray-600 mt-2">Recibe formularios</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">
              🔧 Edge Functions Disponibles
            </h4>
            <ul className="text-sm space-y-1">
              <li><code className="bg-gray-100 px-2 py-1 rounded">resend_integration_test_2026_02_23_19_45</code> - Test de Resend API</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">unified_forms_handler_2026_02_23_19_35</code> - Formularios unificados</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">password_recovery_fixed_2026_02_23_19_30</code> - Recuperación de contraseña</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResend;