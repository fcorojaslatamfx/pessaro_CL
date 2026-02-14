import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, BarChart3, Settings, LogIn, Shield, ArrowRight } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { getMainSiteUrl, getAdminUrl } from '@/lib/domains';

interface LoginMenuProps {
  className?: string;
  onMenuItemClick?: () => void;
}

const LoginMenu: React.FC<LoginMenuProps> = ({ className = '', onMenuItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setShowProfileModal } = useRiskProfile();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: 'Registro de Usuario',
      icon: <User className="w-4 h-4" />,
      href: getMainSiteUrl(ROUTE_PATHS.CLIENT_REGISTER),
      description: 'Registro de cliente',
      external: true
    },
    {
      label: 'Dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
      href: getAdminUrl(ROUTE_PATHS.INTERNAL_LOGIN),
      description: 'Acceso al dashboard',
      external: true
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#00C077] text-white hover:bg-[#00C077]/90 transition-colors shadow-sm flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg"
        size="sm"
      >
        <ArrowRight className="w-4 h-4" />
        Login
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Menú desplegable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="py-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setIsOpen(false);
                    onMenuItemClick?.();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#24d594]/10 text-[#24d594] group-hover:bg-[#24d594]/20 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </a>
              ))}
            </div>
            
            {/* Separador y footer */}
            <div className="border-t border-border bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground text-center">
                Acceso para usuarios autorizados
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginMenu;