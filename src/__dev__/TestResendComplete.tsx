import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestResendComplete: React.FC = () => {
  const [testEmail, setTestEmail] = useState('info@pessaro.cl');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testResendAPI = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
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

  const testAllForms = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('forms_verification_complete_2026_02_24_21_15', {
        body: {
          testType: 'all_forms',
          testEmail: testEmail
        }
      });

      if (error) {
        setResult({ success: false, error: error.message, type: 'all_forms' });
        return;
      }

      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: 'Error durante la verificación completa', details: err });
    } finally {
      setIsLoading(false);
    }
  };

  const testSpecificForm = async (formType: string) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('forms_verification_complete_2026_02_24_21_15', {
        body: {
          testType: formType,
          testEmail: testEmail
        }
      });

      if (error) {
        setResult({ success: false, error: error.message, type: formType });
        return;
      }

      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: `Error durante el test de ${formType}`, details: err });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
            🧪 Verificación Completa de Formularios - Pessaro Capital
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
                Todos los formularios envían notificaciones a <strong>info@pessaro.cl</strong>
              </p>
            </div>
          </div>

          {/* Tests Básicos */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tests Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={testResendAPI}
                disabled={isLoading}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Probando...' : '🔧 Test Resend API'}
              </button>

              <button
                onClick={testContactForm}
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Probando...' : '📧 Test Formulario'}
              </button>

              <button
                onClick={testAllForms}
                disabled={isLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Probando...' : '🎯 Verificar Todos'}
              </button>
            </div>
          </div>

          {/* Tests Específicos de Formularios */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Tests Específicos de Formularios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => testSpecificForm('contact_popup')}
                disabled={isLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 text-sm"
              >
                📋 Popup Contacto
              </button>

              <button
                onClick={() => testSpecificForm('newsletter')}
                disabled={isLoading}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50 text-sm"
              >
                📰 Newsletter
              </button>

              <button
                onClick={() => testSpecificForm('risk_profile')}
                disabled={isLoading}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                📊 Perfil de Riesgo
              </button>

              <button
                onClick={() => testSpecificForm('work_with_us')}
                disabled={isLoading}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 text-sm"
              >
                💼 Trabaja con Nosotros
              </button>

              <button
                onClick={() => testSpecificForm('demo_account')}
                disabled={isLoading}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50 text-sm"
              >
                🎮 Cuenta Demo
              </button>

              <button
                onClick={() => testSpecificForm('trading_guide')}
                disabled={isLoading}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 text-sm"
              >
                📚 Guía de Trading
              </button>
            </div>
          </div>

          {/* Resultados */}
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
                <div className="mt-3">
                  <p className="font-medium mb-2">Detalles del Test:</p>
                  <div className="bg-white p-3 rounded border text-sm">
                    {result.details.test_type && (
                      <p><strong>Tipo:</strong> {result.details.test_type}</p>
                    )}
                    {result.details.email_sent_to && (
                      <p><strong>Email enviado a:</strong> {result.details.email_sent_to}</p>
                    )}
                    {result.details.confirmation_sent_to && (
                      <p><strong>Confirmación enviada a:</strong> {result.details.confirmation_sent_to}</p>
                    )}
                    {result.details.from_email && (
                      <p><strong>From email:</strong> {result.details.from_email}</p>
                    )}
                    {result.details.timestamp && (
                      <p><strong>Timestamp:</strong> {new Date(result.details.timestamp).toLocaleString('es-CL')}</p>
                    )}
                  </div>
                </div>
              )}
              
              {result.details && typeof result.details === 'object' && !result.details.test_type && (
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

          {/* Estado del Sistema */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">
              ℹ️ Estado del Sistema de Emails
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-xs text-gray-600 mt-2">4 funciones activas</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h5 className="font-medium text-blue-900">Email Principal</h5>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mt-2">
                  info@pessaro.cl
                </span>
                <p className="text-xs text-gray-600 mt-2">Recibe formularios</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h5 className="font-medium text-blue-900">From Email</h5>
                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm mt-2">
                  onboarding@resend.dev
                </span>
                <p className="text-xs text-gray-600 mt-2">Dominio por defecto</p>
              </div>
            </div>
          </div>

          {/* Información de Formularios */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">
              📋 Formularios del Website
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Popups de Contacto:</h5>
                <ul className="space-y-1 text-yellow-700">
                  <li>• "Abrir Cuenta Real" → info@pessaro.cl</li>
                  <li>• "Cuenta Demo" → info@pessaro.cl</li>
                  <li>• "Guía de Trading" → info@pessaro.cl</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Otros Formularios:</h5>
                <ul className="space-y-1 text-yellow-700">
                  <li>• Newsletter → info@pessaro.cl</li>
                  <li>• Perfil de Riesgo → info@pessaro.cl</li>
                  <li>• Trabaja con Nosotros → info@pessaro.cl</li>
                  <li>• Contacto General → info@pessaro.cl</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <p className="text-yellow-800 font-medium">
                ✅ Todos los formularios envían notificaciones a <code>info@pessaro.cl</code>
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Los usuarios reciben confirmaciones automáticas en sus emails
              </p>
            </div>
          </div>

          {/* Edge Functions */}
          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              🔧 Edge Functions Disponibles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li><code className="bg-gray-200 px-2 py-1 rounded">resend_integration_test_2026_02_23_19_45</code></li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">unified_forms_handler_2026_02_23_19_35</code></li>
              </ul>
              <ul className="space-y-2">
                <li><code className="bg-gray-200 px-2 py-1 rounded">password_recovery_fixed_2026_02_23_19_30</code></li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">forms_verification_complete_2026_02_24_21_15</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResendComplete;