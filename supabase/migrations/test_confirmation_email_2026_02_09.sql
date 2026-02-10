-- Probar la función de confirmación de emails
SELECT supabase.functions.invoke(
  'send_confirmation_email_2026_02_09',
  '{"formType": "contact", "formData": {"name": "Francisco Rojas", "email": "fcorojas.fx@gmail.com", "subject": "Prueba de confirmación automática"}, "userEmail": "fcorojas.fx@gmail.com"}'::jsonb
) as test_result;