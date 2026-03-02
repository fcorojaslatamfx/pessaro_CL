import { supabase } from '@/integrations/supabase/client';

// Test de integración de Resend API
export const testResendIntegration = async (testEmail: string = 'info@pessaro.cl') => {
  try {
    console.log('🧪 Iniciando test de Resend API...');
    
    const { data, error } = await supabase.functions.invoke('resend_integration_test_2026_02_23_19_45', {
      body: {
        testEmail: testEmail
      }
    });

    if (error) {
      console.error('❌ Error en Edge Function:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Respuesta de Edge Function:', data);
    return data;

  } catch (err) {
    console.error('❌ Error durante el test:', err);
    return {
      success: false,
      error: 'Error durante la ejecución del test',
      details: err
    };
  }
};

// Test rápido de las Edge Functions de formularios
export const testFormsIntegration = async () => {
  try {
    console.log('🧪 Iniciando test de formularios...');
    
    // Test del popup de contacto
    const { data: contactData, error: contactError } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
      body: {
        formType: 'popup',
        formData: {
          fullName: 'Test Usuario',
          email: 'test@pessaro.cl',
          mobile: '+56912345678',
          investmentCapital: 10000,
          managementType: 'PAAM',
          comments: 'Test de integración',
          buttonType: 'account'
        }
      }
    });

    if (contactError) {
      console.error('❌ Error en formulario de contacto:', contactError);
      return {
        success: false,
        error: contactError.message,
        type: 'contact_form'
      };
    }

    console.log('✅ Formulario de contacto funcionando:', contactData);

    // Test del newsletter
    const { data: newsletterData, error: newsletterError } = await supabase.functions.invoke('unified_forms_handler_2026_02_23_19_35', {
      body: {
        formType: 'newsletter',
        formData: {
          email: 'test@pessaro.cl',
          name: 'Test Usuario',
          topics: ['noticias', 'analisis']
        }
      }
    });

    if (newsletterError) {
      console.error('❌ Error en newsletter:', newsletterError);
      return {
        success: false,
        error: newsletterError.message,
        type: 'newsletter'
      };
    }

    console.log('✅ Newsletter funcionando:', newsletterData);

    return {
      success: true,
      message: 'Todos los formularios funcionando correctamente',
      details: {
        contact: contactData,
        newsletter: newsletterData
      }
    };

  } catch (err) {
    console.error('❌ Error durante el test de formularios:', err);
    return {
      success: false,
      error: 'Error durante la ejecución del test de formularios',
      details: err
    };
  }
};

// Test de recuperación de contraseña
export const testPasswordRecovery = async (testEmail: string = 'test@pessaro.cl') => {
  try {
    console.log('🧪 Iniciando test de recuperación de contraseña...');
    
    const { data, error } = await supabase.functions.invoke('password_recovery_fixed_2026_02_23_19_30', {
      body: {
        action: 'request_reset',
        email: testEmail
      }
    });

    if (error) {
      console.error('❌ Error en recuperación de contraseña:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Recuperación de contraseña funcionando:', data);
    return data;

  } catch (err) {
    console.error('❌ Error durante el test de recuperación:', err);
    return {
      success: false,
      error: 'Error durante la ejecución del test de recuperación',
      details: err
    };
  }
};

// Función para ejecutar todos los tests
export const runAllEmailTests = async () => {
  console.log('🚀 Ejecutando todos los tests de email...');
  
  const results = {
    resend_api: await testResendIntegration(),
    forms: await testFormsIntegration(),
    password_recovery: await testPasswordRecovery()
  };

  console.log('📊 Resultados completos:', results);
  return results;
};