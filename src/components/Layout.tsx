import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Mail, MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import { SiLinkedin, SiFacebook, SiX, SiInstagram } from 'react-icons/si';
import { ROUTE_PATHS, PESSARO_LOGO } from '@/lib/index';
import { Button } from '@/components/ui/button';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactPopup from '@/components/ContactPopup';
import NewsletterPopup from '@/components/NewsletterPopup';
import LegalPopup from '@/components/LegalPopup';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';
import LoginMenu from '@/components/LoginMenu';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [legalPopup, setLegalPopup] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'risk' | null }>({
    isOpen: false,
    type: null
  });
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isOpen,
    popupType,
    openPopup,
    closePopup
  } = useContactPopup();
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();

  const openLegalPopup = (type: 'terms' | 'privacy' | 'risk') => {
    setLegalPopup({ isOpen: true, type });
  };

  const closeLegalPopup = () => {
    setLegalPopup({ isOpen: false, type: null });
  };

  const handleMobileNavClick = () => {
    setIsMenuOpen(false);
  };

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    setIsMenuOpen(false);
  }, [location.pathname]);
  const navLinks = [{
    path: ROUTE_PATHS.HOME,
    label: 'Inicio'
  }, {
    path: ROUTE_PATHS.SERVICIOS,
    label: 'Servicios'
  }, {
    path: ROUTE_PATHS.INSTRUMENTOS,
    label: 'Instrumentos'
  }, {
    path: ROUTE_PATHS.EDUCACION,
    label: 'Educación'
  }, {
    path: ROUTE_PATHS.BASE_CONOCIMIENTOS,
    label: 'Base de Conocimientos'
  }, {
    path: ROUTE_PATHS.BLOG,
    label: 'Blog'
  }, {
    path: ROUTE_PATHS.NOSOTROS,
    label: 'Nosotros'
  }, {
    path: ROUTE_PATHS.CONTACTO,
    label: 'Contacto'
  }];
  return <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Header */}
      <header ref={headerRef} className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border py-2 md:py-3 shadow-sm' : 'bg-transparent py-3 md:py-5'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to={ROUTE_PATHS.HOME} onClick={handleMobileNavClick} className="flex items-center gap-2">
            <img src={PESSARO_LOGO} alt="Pessaro Capital" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => <NavLink key={link.path} to={link.path} className={({
            isActive
          }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground/80'}`}>
                {link.label}
              </NavLink>)}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button 
              size="sm" 
              className="bg-accent text-accent-foreground font-semibold shadow-lg hover:shadow-accent/30 hover:bg-accent/90"
              onClick={() => setShowProfileModal(true)}
            >
              Abrir Cuenta
            </Button>
            <LoginMenu />
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-foreground hover:bg-muted rounded-md transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu Principal">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="lg:hidden bg-background border-b border-border relative z-50 shadow-lg">
              <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-4 sm:gap-6 max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain">
                {navLinks.map(link => (
                  <NavLink 
                    key={link.path} 
                    to={link.path} 
                    onClick={handleMobileNavClick} 
                    className={({ isActive }) => 
                      `text-lg font-semibold transition-colors py-3 px-4 rounded-lg hover:bg-muted/50 block min-h-[48px] flex items-center ${
                        isActive ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="flex flex-col gap-4 pt-4 border-t border-border">
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30" onClick={() => { setShowProfileModal(true); setIsMenuOpen(false); }}>
                    Empezar Ahora
                  </Button>
                  <div className="flex justify-center">
                    <LoginMenu />
                  </div>
                </div>
              </nav>
            </motion.div>}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow" style={{
      paddingTop: `${headerHeight}px`
    }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            {/* Company Info */}
            <div className="space-y-6">
              <img src={PESSARO_LOGO} alt="Pessaro Capital" className="h-10 w-auto" />
              <p className="text-sm leading-relaxed opacity-80">
                Pessaro Capital es una entidad financiera líder con más de 15 años de experiencia 
                proporcionando soluciones de inversión de vanguardia y acceso global a los mercados financieros.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-white rounded-full text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  <SiLinkedin size={18} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  <SiFacebook size={18} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  <SiX size={18} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  <SiInstagram size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {navLinks.map(link => <li key={link.path}>
                    <Link to={link.path} className="text-sm opacity-80 hover:text-primary hover:opacity-100 flex items-center gap-2 group">
                      <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      {link.label}
                    </Link>
                  </li>)}
              </ul>
            </div>

            {/* Markets */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Mercados</h4>
              <ul className="space-y-3">
                {['Divisas / Forex', 'Materias Primas', 'Índices Bursátiles', 'Acciones Globales', 'Criptoactivos'].map(market => <li key={market}>
                    <Link to={ROUTE_PATHS.INSTRUMENTOS} className="text-sm opacity-80 hover:text-primary hover:opacity-100 flex items-center gap-2 group">
                      <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      {market}
                    </Link>
                  </li>)}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Newsletter</h4>
              <p className="text-sm opacity-80 leading-relaxed">
                Recibe análisis exclusivos y actualizaciones de mercado personalizadas
              </p>
              <Button 
                onClick={() => setShowNewsletterPopup(true)}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Suscribirse
              </Button>
              <div className="space-y-2">
                <h5 className="text-sm font-semibold">Contacto</h5>
                <ul className="space-y-2">
                  <li className="flex gap-2 items-center">
                    <Phone size={16} className="text-primary shrink-0" />
                    <span className="text-xs opacity-80">+56 9 22 07 15 11</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <Mail size={16} className="text-primary shrink-0" />
                    <span className="text-xs opacity-80">contacto@pessarocapital.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal & Copyright */}
          <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-xs opacity-60 text-center md:text-left">
              © 2026 Pessaro Capital. Todos los derechos reservados. 
              Regulado bajo estándares internacionales de transparencia financiera.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => openLegalPopup('terms')}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Términos y Condiciones
              </button>
              <button 
                onClick={() => openLegalPopup('privacy')}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Política de Privacidad
              </button>
              <button 
                onClick={() => openLegalPopup('risk')}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Advertencia de Riesgo
              </button>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Perfil de Riesgo
              </button>
              <button 
                onClick={() => navigate(ROUTE_PATHS.CLIENT_REGISTER)}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Registro de Clientes
              </button>
              <button 
                onClick={() => openPopup('account')}
                className="text-xs opacity-60 hover:text-primary transition-colors cursor-pointer"
              >
                Contactar Asesor Comercial
              </button>
            </div>
          </div>

          {/* Risk Warning Overlay */}
          <div className="mt-12 p-4 rounded-lg border border-border/50 bg-[rgb(15,21,230)]">
            <p className="text-[10px] leading-relaxed opacity-50 text-justify">
              ADVERTENCIA DE RIESGO: El trading de instrumentos financieros conlleva un alto nivel de riesgo para su capital y puede resultar en pérdidas superiores a su depósito inicial. Los productos apalancados pueden no ser adecuados para todos los inversores. Por favor, asegúrese de comprender plenamente los riesgos involucrados y busque asesoramiento independiente si es necesario. Pessaro Capital no ofrece asesoramiento de inversión directo.
            </p>
          </div>
        </div>
      </footer>
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Contact Popup */}
      <ContactPopup isOpen={isOpen} onClose={closePopup} buttonType={popupType} />
      
      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
        showRegistrationOption={true}
      />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={showNewsletterPopup}
        onClose={() => setShowNewsletterPopup(false)}
      />

      {/* Legal Popup */}
      {legalPopup.type && (
        <LegalPopup
          isOpen={legalPopup.isOpen}
          onClose={closeLegalPopup}
          type={legalPopup.type}
        />
      )}
    </div>;
}