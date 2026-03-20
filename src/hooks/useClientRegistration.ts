import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RegistrationFormData {
  // Paso 1 — Cuenta
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string;
  password:     string;
  confirmPassword: string;

  // Paso 2 — Identidad
  nationality:        string;
  documentType:       string;
  documentNumber:     string;
  tradingExperience:  string;
  investmentCapital:  string;

  // Paso 3 — Domicilio
  address: string;
  city:    string;
  country: string;

  // Paso 4 — Documentos
  documents: Record<string, File | null>;

  // Condiciones
  acceptTerms:   boolean;
  acceptPrivacy: boolean;
}

export type RegistrationStep = 1 | 2 | 3 | 4;

const INITIAL_FORM: RegistrationFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  password: '', confirmPassword: '',
  nationality: 'Chile', documentType: 'rut', documentNumber: '',
  tradingExperience: '', investmentCapital: '',
  address: '', city: '', country: 'Chile',
  documents: {
    dni_front:         null,
    dni_back:          null,
    passport:          null,
    drivers_license:   null,
    proof_of_address:  null,
  },
  acceptTerms: false, acceptPrivacy: false,
};

// ─── Nombres legibles de cada tipo de documento ──────────────────────────────
export const DOCUMENT_LABELS: Record<string, string> = {
  dni_front:        'DNI / Cédula (frente)',
  dni_back:         'DNI / Cédula (reverso)',
  passport:         'Pasaporte',
  drivers_license:  'Licencia de conducir',
  proof_of_address: 'Comprobante de domicilio',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useClientRegistration() {
  const navigate   = useNavigate();
  const [step, setStep]         = useState<RegistrationStep>(1);
  const [form, setForm]         = useState<RegistrationFormData>(INITIAL_FORM);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});

  // ── Actualizar campo ────────────────────────────────────────────────────
  function updateField<K extends keyof RegistrationFormData>(
    key: K,
    value: RegistrationFormData[K]
  ) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function setDocument(type: string, file: File | null) {
    setForm(prev => ({
      ...prev,
      documents: { ...prev.documents, [type]: file },
    }));
  }

  // ── Navegación de pasos ─────────────────────────────────────────────────
  function nextStep() { if (step < 4) setStep(s => (s + 1) as RegistrationStep); }
  function prevStep() { if (step > 1) setStep(s => (s - 1) as RegistrationStep); }

  // ── Submit completo ─────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Llamar Edge Function de registro ──────────────────────────────
      const { data: regData, error: regError } = await supabase.functions.invoke(
        'client_registration_updated_2026_02_14',
        {
          body: {
            action: 'register_client_from_profile',
            profileData: {
              firstName:           form.firstName,
              lastName:            form.lastName,
              email:               form.email,
              phone:               form.phone,
              // Identidad
              nationality:         form.nationality,
              documentType:        form.documentType,
              documentNumber:      form.documentNumber,
              // Domicilio
              address:             form.address,
              city:                form.city,
              country:             form.country,
              // Perfil inversión
              experience:          form.tradingExperience,
              investmentCapital:   form.investmentCapital,
              // Contraseña (para crear Auth user)
              password:            form.password,
            },
          },
        }
      );

      if (regError) throw new Error(regError.message || 'Error al crear la cuenta');
      if (!regData?.success) throw new Error(regData?.error || 'Error al registrar el cliente');

      const userId: string = regData.user?.id;
      if (!userId) throw new Error('No se obtuvo el ID de usuario');

      // ── 2. Subir documentos KYC ──────────────────────────────────────────
      //
      // Ruta en el bucket: kyc-documents/{userId}/{tipo_documento}/{nombre_archivo}
      // Se usa el userId como carpeta raíz para aislar los archivos por usuario.
      // Solo usuarios autenticados con el mismo user_id o admins pueden acceder
      // (controlado por RLS policy en el bucket).
      //
      const uploadResults: Array<{ type: string; path: string; name: string; size: number; mime: string }> = [];

      for (const [docType, file] of Object.entries(form.documents)) {
        if (!file) continue;

        // Actualizar progreso visual
        setUploadProgress(p => ({ ...p, [docType]: 'uploading' }));

        const ext      = file.name.split('.').pop() || 'bin';
        const safeName = `${docType}_${Date.now()}.${ext}`;
        const path     = `${userId}/${docType}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          console.error(`Upload error [${docType}]:`, uploadError.message);
          setUploadProgress(p => ({ ...p, [docType]: 'error' }));
          // No bloquear el registro por un archivo fallido — continuar
          continue;
        }

        setUploadProgress(p => ({ ...p, [docType]: 'done' }));
        uploadResults.push({
          type: docType,
          path,
          name: file.name,
          size: file.size,
          mime: file.type,
        });
      }

      // ── 3. Registrar metadata de documentos en la tabla KYC ──────────────
      //
      // Tabla: client_kyc_documents_2026_03_16
      // Columnas: user_id, document_type, file_path, file_name,
      //           file_size, mime_type, status
      //
      if (uploadResults.length > 0) {
        const rows = uploadResults.map(r => ({
          user_id:       userId,
          document_type: r.type,
          file_path:     r.path,
          file_name:     r.name,
          file_size:     r.size,
          mime_type:     r.mime,
          status:        'pending_review',  // pendiente de revisión por admin
          created_at:    new Date().toISOString(),
          updated_at:    new Date().toISOString(),
        }));

        const { error: dbError } = await supabase
          .from('client_kyc_documents_2026_03_16')
          .insert(rows);

        if (dbError) {
          // Log del error pero no interrumpir — los archivos ya están en Storage
          console.error('KYC DB insert error:', dbError.message);
        }
      }

      // ── 4. Éxito ─────────────────────────────────────────────────────────
      setSuccess(true);

      // Redirigir al portal del cliente después de 2 segundos
      setTimeout(() => navigate('/portal-cliente'), 2000);

    } catch (err: any) {
      setError(err.message || 'Error desconocido al procesar el registro');
    } finally {
      setLoading(false);
    }
  }

  // ── Validación por paso ─────────────────────────────────────────────────
  function isStepValid(s: RegistrationStep): boolean {
    switch (s) {
      case 1:
        return !!(
          form.firstName &&
          form.lastName &&
          form.email &&
          form.phone &&
          form.password &&
          form.password.length >= 8 &&
          form.password === form.confirmPassword
        );
      case 2:
        return !!(form.documentType && form.documentNumber);
      case 3:
        return !!(form.address && form.city && form.country);
      case 4:
        // Documentos obligatorios: dni_front y proof_of_address
        return !!(
          form.documents.dni_front &&
          form.documents.proof_of_address &&
          form.acceptTerms &&
          form.acceptPrivacy
        );
      default:
        return false;
    }
  }

  return {
    step, form, loading, error, success, uploadProgress,
    updateField, setDocument,
    nextStep, prevStep,
    handleSubmit, isStepValid,
    DOCUMENT_LABELS,
  };
}
