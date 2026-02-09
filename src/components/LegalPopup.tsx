import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LegalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'risk';
}

const LegalPopup: React.FC<LegalPopupProps> = ({ isOpen, onClose, type }) => {
  const getContent = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Términos y Condiciones',
          icon: <FileText className="w-6 h-6" />,
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Aceptación de los Términos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Al acceder y utilizar los servicios de Pessaro Capital, usted acepta estar sujeto a estos términos y condiciones. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Servicios Financieros</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pessaro Capital proporciona servicios de intermediación financiera, análisis de mercado y acceso a instrumentos 
                  de inversión. Nuestros servicios están dirigidos a inversores que comprenden los riesgos asociados con el trading 
                  de instrumentos financieros.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Elegibilidad del Cliente</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para utilizar nuestros servicios, debe ser mayor de edad según las leyes de su jurisdicción, tener capacidad 
                  legal para celebrar contratos y cumplir con todos los requisitos regulatorios aplicables.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Responsabilidades del Cliente</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Proporcionar información precisa y actualizada</li>
                  <li>• Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>• Cumplir con todas las leyes y regulaciones aplicables</li>
                  <li>• Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Limitación de Responsabilidad</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pessaro Capital no será responsable por pérdidas resultantes de condiciones de mercado, fallas técnicas, 
                  o decisiones de inversión del cliente. El cliente reconoce que el trading conlleva riesgos significativos.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Modificaciones</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán 
                  en vigor inmediatamente después de su publicación en nuestro sitio web.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. Ley Aplicable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Estos términos se rigen por las leyes de Chile. Cualquier disputa será resuelta en los tribunales competentes de Santiago.
                </p>
              </section>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Última actualización:</strong> Febrero 2026<br/>
                  Para consultas sobre estos términos, contacte: legal@pessarocapital.com
                </p>
              </div>
            </div>
          )
        };

      case 'privacy':
        return {
          title: 'Política de Privacidad',
          icon: <Shield className="w-6 h-6" />,
          content: (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. Información que Recopilamos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Recopilamos información necesaria para proporcionar nuestros servicios financieros:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Información personal: nombre, dirección, teléfono, email</li>
                  <li>• Información financiera: ingresos, experiencia de inversión, objetivos</li>
                  <li>• Información de identificación: documentos de identidad, verificación KYC</li>
                  <li>• Datos de uso: actividad en la plataforma, preferencias de trading</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. Uso de la Información</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Utilizamos su información para:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Proporcionar servicios de trading e inversión</li>
                  <li>• Cumplir con requisitos regulatorios y de compliance</li>
                  <li>• Mejorar nuestros servicios y experiencia del usuario</li>
                  <li>• Comunicar actualizaciones importantes y oportunidades de mercado</li>
                  <li>• Prevenir fraude y garantizar la seguridad de la plataforma</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. Compartir Información</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No vendemos ni alquilamos su información personal. Podemos compartir información con:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Proveedores de liquidez y contrapartes autorizadas</li>
                  <li>• Autoridades regulatorias cuando sea requerido por ley</li>
                  <li>• Proveedores de servicios técnicos bajo acuerdos de confidencialidad</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Seguridad de Datos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizacionales para proteger su información, 
                  incluyendo encriptación, firewalls, y controles de acceso estrictos.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Sus Derechos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  Usted tiene derecho a:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Acceder a su información personal</li>
                  <li>• Solicitar corrección de datos inexactos</li>
                  <li>• Solicitar eliminación de datos (sujeto a requisitos regulatorios)</li>
                  <li>• Oponerse al procesamiento para marketing directo</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Cookies y Tecnologías Similares</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Utilizamos cookies para mejorar la funcionalidad del sitio, analizar el uso y personalizar su experiencia. 
                  Puede gestionar las preferencias de cookies en la configuración de su navegador.
                </p>
              </section>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Última actualización:</strong> Febrero 2026<br/>
                  Para ejercer sus derechos o consultas: privacy@pessarocapital.com
                </p>
              </div>
            </div>
          )
        };

      case 'risk':
        return {
          title: 'Advertencia de Riesgo',
          icon: <AlertTriangle className="w-6 h-6" />,
          content: (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">ADVERTENCIA IMPORTANTE</h3>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">
                  El trading de instrumentos financieros conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores.
                </p>
              </div>

              <section>
                <h3 className="text-lg font-semibold mb-3">Riesgos Principales</h3>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li>
                    <strong>Pérdida de Capital:</strong> Puede perder parte o la totalidad de su inversión inicial. 
                    Los productos apalancados pueden resultar en pérdidas superiores a su depósito inicial.
                  </li>
                  <li>
                    <strong>Volatilidad del Mercado:</strong> Los precios de los instrumentos financieros pueden 
                    fluctuar rápidamente debido a factores económicos, políticos y de mercado.
                  </li>
                  <li>
                    <strong>Riesgo de Apalancamiento:</strong> El apalancamiento amplifica tanto las ganancias 
                    como las pérdidas potenciales, aumentando significativamente el riesgo.
                  </li>
                  <li>
                    <strong>Riesgo de Liquidez:</strong> Algunos instrumentos pueden tener liquidez limitada, 
                    dificultando la ejecución de órdenes al precio deseado.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Instrumentos Específicos</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Forex (Divisas)</h4>
                    <p className="text-xs text-muted-foreground">
                      Extremadamente volátil, afectado por eventos geopolíticos, decisiones de bancos centrales y datos económicos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">CFDs (Contratos por Diferencia)</h4>
                    <p className="text-xs text-muted-foreground">
                      Productos complejos con alto riesgo de pérdida rápida debido al apalancamiento.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Criptomonedas</h4>
                    <p className="text-xs text-muted-foreground">
                      Extremadamente volátiles, no reguladas, susceptibles a manipulación y cambios regulatorios.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Materias Primas</h4>
                    <p className="text-xs text-muted-foreground">
                      Afectadas por factores climáticos, geopolíticos y de oferta/demanda global.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Recomendaciones</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Solo invierta dinero que pueda permitirse perder</li>
                  <li>• Busque asesoramiento financiero independiente si es necesario</li>
                  <li>• Comprenda completamente los instrumentos antes de operar</li>
                  <li>• Utilice herramientas de gestión de riesgo como stop-loss</li>
                  <li>• Diversifique su cartera de inversiones</li>
                  <li>• Manténgase informado sobre los mercados y factores que los afectan</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">Responsabilidad del Cliente</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Al utilizar nuestros servicios, usted reconoce que ha leído, comprendido y aceptado todos los riesgos 
                  asociados. Pessaro Capital no proporciona asesoramiento de inversión personalizado y no garantiza 
                  resultados de trading.
                </p>
              </section>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Regulación:</strong> Pessaro Capital opera bajo estándares internacionales de transparencia financiera. 
                  Esta advertencia de riesgo forma parte integral de nuestros términos de servicio.
                </p>
              </div>
            </div>
          )
        };

      default:
        return { title: '', icon: null, content: null };
    }
  };

  const { title, icon, content } = getContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh]"
          >
            <Card className="shadow-2xl">
              <CardHeader className="relative border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <CardTitle className="flex items-center gap-3 text-2xl pr-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    type === 'risk' ? 'bg-red-100 text-red-600' : 
                    type === 'privacy' ? 'bg-blue-100 text-blue-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {icon}
                  </div>
                  {title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[60vh] p-6">
                  {content}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LegalPopup;