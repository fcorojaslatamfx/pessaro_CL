import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DownloadData {
  fullName: string;
  phone: string;
  email: string;
}

interface DownloadContent {
  type: 'rutas' | 'base-conocimientos' | 'faq';
  title: string;
}

export const useDownload = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<DownloadContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const openDownloadPopup = (type: 'rutas' | 'base-conocimientos' | 'faq', title: string) => {
    setCurrentContent({ type, title });
    setIsPopupOpen(true);
  };

  const closeDownloadPopup = () => {
    setIsPopupOpen(false);
    setCurrentContent(null);
  };

  const processDownload = async (data: DownloadData) => {
    if (!currentContent) return;

    setIsProcessing(true);

    try {
      // Registrar la descarga en la base de datos
      const { error: insertError } = await supabase
        .from('education_downloads')
        .insert({
          full_name: data.fullName,
          phone: data.phone,
          email: data.email,
          content_type: currentContent.type,
          content_title: currentContent.title,
          downloaded_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error registrando descarga:', insertError);
      }

      // Enviar email de confirmación con el contenido
      const { error: emailError } = await supabase.functions.invoke('send_education_content_2026_02_13', {
        body: {
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          contentType: currentContent.type,
          contentTitle: currentContent.title
        }
      });

      if (emailError) {
        console.error('Error enviando email:', emailError);
      }

      // Generar y descargar el PDF
      generatePDF(currentContent.type, data.fullName);

    } catch (error) {
      console.error('Error en proceso de descarga:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = (contentType: string, userName: string) => {
    // Crear contenido del PDF basado en el tipo
    const pdfContent = getPDFContent(contentType);
    
    // Simular descarga del PDF
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pessaro-capital-${contentType}-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPDFContent = (contentType: string): string => {
    const baseContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 750 Td
(PESSARO CAPITAL - CONTENIDO EDUCATIVO) Tj
0 -50 Td
/F1 16 Tf
(${getContentTitle(contentType)}) Tj
0 -30 Td
/F1 12 Tf
(Descargado desde: pessaro.cl/educacion) Tj
0 -20 Td
(Fecha: ${new Date().toLocaleDateString('es-CL')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000348 00000 n 
0000000565 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
625
%%EOF`;

    return baseContent;
  };

  const getContentTitle = (contentType: string): string => {
    const titles = {
      'rutas': 'RUTAS DE APRENDIZAJE ESTRUCTURADAS',
      'base-conocimientos': 'BASE DE CONOCIMIENTOS COMPLETA',
      'faq': 'PREGUNTAS FRECUENTES SOBRE TRADING'
    };
    return titles[contentType as keyof typeof titles] || 'CONTENIDO EDUCATIVO';
  };

  return {
    isPopupOpen,
    currentContent,
    isProcessing,
    openDownloadPopup,
    closeDownloadPopup,
    processDownload
  };
};