import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, ChevronRight } from 'lucide-react';
import { SiLinkedin, SiFacebook, SiX, SiInstagram } from 'react-icons/si';
import { ROUTE_PATHS, PESSARO_LOGO_HEADER, PESSARO_LOGO_FOOTER } from '@/lib/index';
import { Button } from '@/components/ui/button';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactPopup from '@/components/ContactPopup';
import NewsletterPopup from '@/components/NewsletterPopup';
import LegalPopup from '@/components/LegalPopup';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import RiskProfileModal from '@/components/RiskProfileModal';
import LoginMenu from '@/components/LoginMenu';
import { FullscreenOverlay } from '@/components/FullscreenOverlay';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useAuth } from '@/hooks/useAuth';
import { isLoginDomain, isLoginRoute, isDevelopment, getMainSiteUrl } from '@/lib/domains';
import LoginLayout from '@/components/LoginLayout';
import { useTrackNavigation } from '@/hooks/useTrackNavigation';
import { useWorkWithUs } from '@/hooks/useWorkWithUs';
import WorkWithUsPopup from '@/components/WorkWithUsPopup';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  useTrackNavigation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [legalPopup, setLegalPopup] = useState<{
    isOpen: boolean;
    type: 'terms' | 'privacy' | 'risk' | null;
  }>({ isOpen: false, type: null });

  const { isOpen: isWorkWithUsOpen, openPopup: openWorkWithUsPopup, closePopup: closeWorkWithUsPopup } = useWorkWithUs();
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { isOpen, popupType, openPopup, closePopup } = useContactPopup();
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();
  const { hideWhatsApp, showWhatsApp } = useWhatsApp();
  const { user } = useAuth();

  const shouldUseLoginLayout = isLoginDomain() || (isDevelopment() && isLoginRoute(location.pathname));
  if (shouldUseLoginLayout) {
    return <LoginLayout>{children}</LoginLayout>;
  }

  const openLegalPopup = (type: 'terms' | 'privacy' | 'risk') => setLegalPopup({ isOpen: true, type });
  const closeLegalPopup = () => setLegalPopup({ isOpen: false, type: null });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hasOpenPopup = isOpen || showProfileModal || showNewsletterPopup || legalPopup.isOpen || isWorkWithUsOpen;
    if (hasOpenPopup) { hideWhatsApp(); } else { showWhatsApp(); }
  }, [isOpen, showProfileModal, showNewsletterPopup, legalPopup.isOpen, isWorkWithUsOpen, hideWhatsApp, showWhatsApp]);

  const navLinks = [
    { path: ROUTE_PATHS.HOME,         label: 'Inicio'       },
    { path: ROUTE_PATHS.SERVICIOS,    label: 'Servicios'    },
    { path: ROUTE_PATHS.INSTRUMENTOS, label: 'Instrumentos' },
    { path: ROUTE_PATHS.EDUCACION,    label: 'Educación'    },
    { path: ROUTE_PATHS.BLOG,         label: 'Blog'         },
    { path: ROUTE_PATHS.NOSOTROS,     label: 'Nosotros'     },
    { path: ROUTE_PATHS.CONTACTO,     label: 'Contacto'     },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ══ HEADER ══ */}
      <header
        ref={headerRef}
        role="banner"
        aria-label="Navegación principal"
        className={`
          fixed top-0 left-0 right-0 z-50 border-b py-1 sm:py-2
          transition-all duration-300 safe-area-top
          ${isScrolled
            ? 'bg-[#1a1f6e]/95 backdrop-blur-md border-blue-800/60 shadow-lg shadow-blue-950/30'
            : 'bg-[#1a1f6e] border-blue-800'
          }
        `}
      >
        <div className="container-wide flex items-center h-full">

          {/* Logo */}
          <Link
            to={ROUTE_PATHS.HOME}
            className="flex items-center gap-2 touch-target"
            aria-label="Ir a la página principal de Pessaro Capital"
          >
            <img
              src={PESSARO_LOGO_HEADER}
              alt="Pessaro Capital"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop: nav links — visible en lg+ (≥1024px) */}
          <nav
            className="hidden lg:flex items-center gap-6 lg:gap-8 ml-8"
            role="navigation"
            aria-label="Menú principal"
          >
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm lg:text-base font-medium transition-all duration-200
                   text-white hover:text-blue-200 px-3 py-2 rounded-md hover:bg-white/10
                   ${isActive ? 'text-blue-200 bg-white/20' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop: CTAs — visible en lg+ (≥1024px) */}
          <div className="hidden lg:flex flex-row items-center gap-4 ml-auto">
            <Button
              size="sm"
              className="flex-shrink-0 px-6 py-2.5 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm"
              onClick={() => setShowProfileModal(true)}
            >
              Abrir Cuenta
            </Button>
            {/* LoginMenu desktop — dropdown hacia abajo (comportamiento por defecto) */}
            <LoginMenu />
          </div>

          {/*
            ── Móvil/Tablet: FullscreenOverlay ──────────────────────────────
            Visible SOLO en <lg (< 1024px), mismo breakpoint que el nav desktop.
            Incluye su propio botón hamburger/X — NO agregar ningún otro botón aquí.
            Se pasa onOpenAccount para que "Abrir Cuenta" dentro del overlay
            pueda abrir el RiskProfileModal que vive en este Layout.
          */}
          <div className="lg:hidden ml-auto">
            <FullscreenOverlay onOpenAccount={() => setShowProfileModal(true)} />
          </div>

        </div>
      </header>

      {/* ══ CONTENIDO ══ */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ══ FOOTER ══ */}
      <footer
        className="bg-secondary text-secondary-foreground py-responsive-sm border-t border-border safe-area-bottom"
        role="contentinfo"
        aria-label="Información de la empresa y enlaces adicionales"
      >
        <div className="container-wide">
          <div className="grid grid-responsive-4 gap-responsive-lg mb-responsive-lg">

            {/* Empresa */}
            <div className="space-mobile-sm">
              <img
                src={PESSARO_LOGO_FOOTER}
                alt="Pessaro Capital"
                className="h-8 sm:h-10 w-auto"
                loading="lazy"
                decoding="async"
              />
              <p className="text-caption leading-relaxed opacity-80">
                Pessaro Capital es una entidad financiera líder con más de 15 años de experiencia
                proporcionando soluciones de inversión de vanguardia y acceso global a los mercados financieros.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                {[
                  { href: 'https://www.linkedin.com/company/pessarocapital/?viewAsMember=true', Icon: SiLinkedin },
                  { href: 'https://facebook.com/pessarocapital', Icon: SiFacebook },
                  { href: 'https://x.com/pessaro', Icon: SiX },
                  { href: 'https://instagram.com/pessarocapital', Icon: SiInstagram },
                ].map(({ href, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target p-2 bg-white rounded-full text-accent hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm opacity-70 hover:opacity-100 hover:text-green-400 flex items-center gap-2 group transition-all"
                    >
                      <ChevronRight size={14} className="text-green-400 opacity-0 group-hover:opacity-100 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mercados */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Mercados</h4>
              <ul className="space-y-3">
                {['Divisas / Forex', 'Materias Primas', 'Índices Bursátiles', 'Acciones Globales', 'Criptoactivos'].map(market => (
                  <li key={market}>
                    <Link
                      to={ROUTE_PATHS.INSTRUMENTOS}
                      className="text-sm opacity-70 hover:opacity-100 hover:text-green-400 flex items-center gap-2 group transition-all"
                    >
                      <ChevronRight size={14} className="text-green-400 opacity-0 group-hover:opacity-100 transition-all" />
                      {market}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold">Newsletter</h4>
              <p className="text-sm opacity-80 leading-relaxed">
                Recibe análisis exclusivos y actualizaciones de mercado personalizadas
              </p>
              <Button onClick={() => setShowNewsletterPopup(true)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Suscribirse
              </Button>
              <Button onClick={openWorkWithUsPopup} className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors mt-3">
                Trabaja con Nosotros
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

          {/* Legal */}
          <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-xs opacity-60 text-center md:text-left">
              © 2026 Pessaro Capital. Todos los derechos reservados.
              Regulado bajo estándares internacionales de transparencia financiera.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button onClick={() => openLegalPopup('terms')}   className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">Términos y Condiciones</button>
              <button onClick={() => openLegalPopup('privacy')} className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">Política de Privacidad</button>
              <button onClick={() => openLegalPopup('risk')}    className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">Advertencia de Riesgo</button>
              <button onClick={() => setShowProfileModal(true)} className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">Perfil de Riesgo</button>
              <a href={getMainSiteUrl(ROUTE_PATHS.CLIENT_REGISTER)} target="_blank" rel="noopener noreferrer" className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">
                Registro de Clientes
              </a>
              <button onClick={() => openPopup('account')} className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer">
                Contactar Asesor Comercial
              </button>
              <button
                onClick={() => {
                  if (user && ['interno', 'admin', 'super_admin'].includes(user.role)) {
                    navigate(ROUTE_PATHS.CMS_DASHBOARD);
                  } else if (user) {
                    alert('Acceso restringido: Solo usuarios internos y administradores pueden acceder al CMS');
                  } else {
                    navigate(ROUTE_PATHS.INTERNAL_LOGIN);
                  }
                }}
                className="text-xs opacity-70 hover:opacity-100 hover:text-green-400 transition-all cursor-pointer"
              >
                Sistema CMS
              </button>
            </div>
          </div>

          {/* Aviso de riesgo */}
          <div className="mt-12 p-4 rounded-lg border border-border/50 bg-[rgb(15,21,230)]">
            <p className="text-[10px] leading-relaxed opacity-50 text-justify">
              ADVERTENCIA DE RIESGO: El trading de instrumentos financieros conlleva un alto nivel de riesgo
              para su capital y puede resultar en pérdidas superiores a su depósito inicial. Los productos
              apalancados pueden no ser adecuados para todos los inversores. Por favor, asegúrese de comprender
              plenamente los riesgos involucrados y busque asesoramiento independiente si es necesario.
              Pessaro Capital no ofrece asesoramiento de inversión directo.
            </p>
          </div>
        </div>
      </footer>

      {/* ══ MODALES / POPUPS ══ */}
      <WhatsAppButton />
      <ContactPopup isOpen={isOpen} onClose={closePopup} buttonType={popupType} />
      <RiskProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} onSave={saveProfile} />
      <NewsletterPopup isOpen={showNewsletterPopup} onClose={() => setShowNewsletterPopup(false)} />
      <LegalPopup isOpen={legalPopup.isOpen} type={legalPopup.type} onClose={closeLegalPopup} />
      <WorkWithUsPopup isOpen={isWorkWithUsOpen} onClose={closeWorkWithUsPopup} />
    </div>
  );
}
