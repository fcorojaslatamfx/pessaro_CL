import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SimpleResendTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState('info@pessaro.cl');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testResendAPI = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Iniciando test de Resend API...');
      
      const { data, error } = await supabase.functions.invoke('resend_integration_test_2026_02_23_19_45', {
        body: {
          testEmail: testEmail
        }
      });

      if (error) {
        console.error('❌ Error en Edge Function:', error);
        setResult({
          success: false,
          error: error.message,
          details: error
        });
        return;
      }

      console.log('✅ Respuesta de Edge Function:', data);
      setResult(data);

    } catch (err) {
      console.error('❌ Error durante el test:', err);
      setResult({
        success: false,
        error: 'Error durante la ejecución del test',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testContactForm = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Iniciando test de formulario de contacto...');
      
      const { data, error } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
        body: {
          formType: 'popup',
          formData: {
            fullName: 'Test Usuario',
            email: testEmail,
            mobile: '+56912345678',
            investmentCapital: 10000,
            managementType: 'PAAM',
            comments: 'Test de integración desde página de prueba',
            buttonType: 'account'
          }
        }
      });

      if (error) {
        console.error('❌ Error en formulario:', error);
        setResult({
          success: false,
          error: error.message,
          type: 'contact_form'
        });
        return;
      }

      console.log('✅ Formulario funcionando:', data);
      setResult(data);

    } catch (err) {
      console.error('❌ Error durante el test:', err);
      setResult({
        success: false,
        error: 'Error durante la ejecución del test de formulario',
        details: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#0A2687', marginBottom: '20px' }}>
        🧪 Test de Resend API - Pessaro Capital
      </h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Configuración de Prueba</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email de Prueba:
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="email@ejemplo.com"
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            Se enviará un email de prueba a esta dirección
          </small>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button
          onClick={testResendAPI}
          disabled={isLoading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#0A2687',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '⏳ Probando...' : '🧪 Test Resend API'}
        </button>

        <button
          onClick={testContactForm}
          disabled={isLoading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#00C077',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '⏳ Probando...' : '📧 Test Formulario'}
        </button>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.success ? '#155724' : '#721c24',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>
            {result.success ? '✅ ÉXITO' : '❌ ERROR'}
          </h4>
          
          {result.message && (
            <p style={{ margin: '5px 0' }}>
              <strong>Mensaje:</strong> {result.message}
            </p>
          )}
          
          {result.error && (
            <p style={{ margin: '5px 0' }}>
              <strong>Error:</strong> {result.error}
            </p>
          )}
          
          {result.details && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Ver Detalles Técnicos
              </summary>
              <pre style={{ 
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '5px'
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '15px', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0A2687' }}>
          ℹ️ Información del Sistema
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li><strong>Resend API:</strong> Configurada ✅</li>
          <li><strong>Edge Functions:</strong> Desplegadas ✅</li>
          <li><strong>Email principal:</strong> info@pessaro.cl</li>
          <li><strong>From email:</strong> onboarding@resend.dev</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
          🔧 Edge Functions Disponibles
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '12px' }}>
          <li><code>resend_integration_test_2026_02_23_19_45</code> - Test de Resend API</li>
          <li><code>unified_forms_handler_2026_02_23_19_35</code> - Formularios unificados</li>
          <li><code>password_recovery_fixed_2026_02_23_19_30</code> - Recuperación de contraseña</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleResendTest;