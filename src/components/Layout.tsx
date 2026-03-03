import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import LoginMenu from '@/components/LoginMenu';
import LoginLayout from '@/components/LoginLayout';
import { useTrackNavigation } from '@/hooks/useTrackNavigation';
import { isLoginDomain, isDevelopment, isLoginRoute } from '@/lib/domains';
import { useWorkWithUs } from '@/hooks/useWorkWithUs';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useAuth } from '@/hooks/useAuth';
// Importación directa del logo (ajusta el nombre del archivo exacto que tienes)
// import PESSARO_LOGO_HEADER from '@/assets/pessaro-logo-header.png'; 
// o si está en public/images:
const PESSARO_LOGO_HEADER = '/images/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // -----------------------------
  // TODOS LOS HOOKS VAN AQUÍ
  // -----------------------------
  useTrackNavigation();

  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(80);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

  const [legalPopup, setLegalPopup] = useState<{
    isOpen: boolean;
    type: 'terms' | 'privacy' | 'risk' | null;
  }>({
    isOpen: false,
    type: null
  });

  const {
    isOpen: isWorkWithUsOpen,
    openPopup: openWorkWithUsPopup,
    closePopup: closeWorkWithUsPopup
  } = useWorkWithUs();

  const {
    isOpen,
    popupType,
    openPopup,
    closePopup
  } = useContactPopup();

  const {
    showProfileModal,
    setShowProfileModal,
    saveProfile
  } = useRiskProfile();

  const { hideWhatsApp, showWhatsApp } = useWhatsApp();
  const { user } = useAuth();

  // -----------------------------
  // LÓGICA DE LOGIN LAYOUT
  // -----------------------------
  const shouldUseLoginLayout =
    isLoginDomain() ||
    (isDevelopment() && isLoginRoute(location.pathname));

  if (shouldUseLoginLayout) {
    return <LoginLayout>{children}</LoginLayout>;
  }

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const openLegalPopup = (type: 'terms' | 'privacy' | 'risk') => {
    setLegalPopup({ isOpen: true, type });
  };

  const closeLegalPopup = () => {
    setLegalPopup({ isOpen: false, type: null });
  };

  const handleMobileNavClick = () => {
    setIsMenuOpen(false);
  };

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

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

  useEffect(() => {
    const hasOpenPopup =
      isOpen ||
      showProfileModal ||
      showNewsletterPopup ||
      legalPopup.isOpen ||
      isWorkWithUsOpen;

    const shouldHideWhatsApp = hasOpenPopup || isMenuOpen;

    if (shouldHideWhatsApp) {
      hideWhatsApp();
    } else {
      showWhatsApp();
    }
  }, [
    isOpen,
    showProfileModal,
    showNewsletterPopup,
    legalPopup.isOpen,
    isWorkWithUsOpen,
    isMenuOpen,
    hideWhatsApp,
    showWhatsApp
  ]);

  // -----------------------------
  // NAV LINKS
  // -----------------------------
  const navLinks = [
    { path: ROUTE_PATHS.HOME, label: 'Inicio' },
    { path: ROUTE_PATHS.SERVICIOS, label: 'Servicios' },
    { path: ROUTE_PATHS.INSTRUMENTOS, label: 'Instrumentos' },
    { path: ROUTE_PATHS.EDUCACION, label: 'Educación' },
    { path: ROUTE_PATHS.BLOG, label: 'Blog' },
    { path: ROUTE_PATHS.NOSOTROS, label: 'Nosotros' },
    { path: ROUTE_PATHS.CONTACTO, label: 'Contacto' }
  ];

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header
        ref={headerRef}
        role="banner"
        aria-label="Navegación principal"
        className="fixed top-0 left-0 right-0 z-50 bg-blue-900 border-b border-blue-800 py-1 sm:py-2 transition-all duration-300 safe-area-top"
      >
        <div className="container-wide flex items-center h-full">
          <Link
            to={ROUTE_PATHS.HOME}
            onClick={handleMobileNavClick}
            className="flex items-center gap-2 touch-target"
            aria-label="Ir a la página principal de Pessaro Capital"
          >
            <img
              src={PESSARO_LOGO_HEADER}
              alt="Pessaro Capital - Plataforma de Trading"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
          </Link>

          <nav
            className="desktop-only flex items-center gap-6 lg:gap-8 ml-8"
            role="navigation"
            aria-label="Menú principal"
          >
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm lg:text-base font-medium transition-all duration-200 text-white hover:text-blue-200 px-3 py-2 rounded-md hover:bg-white/10 ${
                    isActive ? 'text-blue-200 bg-white/20' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="desktop-only flex flex-row items-center gap-4 ml-auto">
            <Button
              size="sm"
              className="flex-shrink-0 px-6 py-2.5 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm"
              onClick={() => setShowProfileModal(true)}
            >
              Abrir Cuenta
            </Button>
            <LoginMenu />
          </div>

          <button
            className="mobile-tablet touch-target p-2 text-foreground hover:bg-muted rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            type="button"
          >
            {isMenuOpen ? (
              <X size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            ) : (
              <Menu size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 pt-[80px]">{children}</main>
    </div>
  );
};

export default Layout;
