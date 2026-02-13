import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Star, Trophy, Download, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SurpriseGiftPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const gifts = [
  {
    id: 'ebook',
    title: 'eBook Exclusivo: "Guía Completa del Trading Profesional"',
    description: 'Una guía de 150 páginas con estrategias avanzadas, análisis técnico y gestión de riesgo.',
    icon: <Download className="w-8 h-8" />,
    action: 'Descargar Gratis',
    value: '$49 USD',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'webinar',
    title: 'Acceso VIP: Webinar "Secretos de los Traders Exitosos"',
    description: 'Sesión exclusiva de 2 horas con nuestros analistas senior y casos de estudio reales.',
    icon: <Trophy className="w-8 h-8" />,
    action: 'Reservar Cupo',
    value: '$97 USD',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'consultation',
    title: 'Consulta Gratuita: Análisis Personalizado de Portafolio',
    description: 'Sesión 1-a-1 de 30 minutos con un asesor experto para revisar tu estrategia de inversión.',
    icon: <Star className="w-8 h-8" />,
    action: 'Agendar Cita',
    value: '$150 USD',
    color: 'from-orange-500 to-red-600'
  }
];

const SurpriseGiftPopup: React.FC<SurpriseGiftPopupProps> = ({ isOpen, onClose }) => {
  const [selectedGift, setSelectedGift] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Seleccionar regalo aleatorio
      const randomGift = Math.floor(Math.random() * gifts.length);
      setSelectedGift(randomGift);
      
      // Mostrar confetti después de un breve delay
      setTimeout(() => {
        setShowConfetti(true);
      }, 500);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  const currentGift = gifts[selectedGift];

  const handleClaimGift = () => {
    // Aquí se podría integrar con el sistema de regalos
    // Por ahora, simplemente cerramos el popup
    alert(`¡Felicidades! Tu ${currentGift.title} será enviado a tu correo electrónico en los próximos minutos.`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative bg-background border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -20, 
                      x: Math.random() * 400,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{ 
                      y: 500, 
                      rotate: 360,
                      opacity: 0
                    }}
                    transition={{ 
                      duration: 3,
                      delay: Math.random() * 2,
                      ease: "easeOut"
                    }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)]
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Header */}
            <div className="text-center pt-8 pb-6 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-2">¡Felicidades! 🎉</h2>
                <p className="text-muted-foreground">
                  Como agradecimiento por ayudarnos a mejorar, tienes un regalo especial:
                </p>
              </motion.div>
            </div>

            {/* Gift Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="px-6 pb-6"
            >
              <Card className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${currentGift.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentGift.color} text-white flex-shrink-0`}>
                      {currentGift.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{currentGift.title}</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Valor: {currentGift.value}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {currentGift.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="px-6 pb-6"
            >
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleClaimGift}
                  className={`w-full bg-gradient-to-r ${currentGift.color} hover:opacity-90 text-white font-semibold py-3`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {currentGift.action}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Reclamar Más Tarde
                </Button>
              </div>
            </motion.div>

            {/* Footer */}
            <div className="bg-muted/30 px-6 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                * Este regalo es válido por 48 horas. Revisa tu correo electrónico para más detalles.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SurpriseGiftPopup;