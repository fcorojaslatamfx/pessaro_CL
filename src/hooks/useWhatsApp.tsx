import { createContext, useContext, useState, ReactNode } from 'react';

interface WhatsAppContextType {
  isVisible: boolean;
  hideWhatsApp: () => void;
  showWhatsApp: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  const hideWhatsApp = () => setIsVisible(false);
  const showWhatsApp = () => setIsVisible(true);

  return (
    <WhatsAppContext.Provider value={{ isVisible, hideWhatsApp, showWhatsApp }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}