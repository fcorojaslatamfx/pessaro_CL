'use client';

import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import LoginMenu from '@/components/LoginMenu';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/',             label: 'Inicio'       },
  { href: '/servicios',    label: 'Servicios'    },
  { href: '/instrumentos', label: 'Instrumentos' },
  { href: '/educacion',    label: 'Educación'    },
  { href: '/blog',         label: 'Blog'         },
  { href: '/nosotros',     label: 'Nosotros'     },
  { href: '/contacto',     label: 'Contacto'     },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
  exit:   { opacity: 0, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 380, damping: 26 } },
  exit:    { opacity: 0, x: 20 },
};

interface FullscreenOverlayProps {
  /**
   * Callback para abrir el modal RiskProfileModal que vive en Layout.
   * Se pasa desde Layout para evitar tener dos instancias del hook useRiskProfile.
   */
  onOpenAccount: () => void;
}

export function FullscreenOverlay({ onOpenAccount }: FullscreenOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const handleToggle = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  }, []);

  return (
    <>
      {/*
        ── Botón hamburger del navbar ───────────────────────────────────────
        Cuando el overlay está CERRADO: z-[200] para estar sobre todo.
        Cuando el overlay está ABIERTO:  z-[99]  para quedar DETRÁS del overlay
        (z-[100]), evitando la doble X. El X interno del overlay se encarga
        del cierre mientras el overlay está abierto.
        onPointerDown en vez de onClick: fix iOS Safari delay 300ms.
      */}
      <button
        type="button"
        onPointerDown={handleToggle}
        className={`touch-target p-2 text-white rounded-md transition-colors hover:bg-white/10 relative [touch-action:manipulation] ${isOpen ? 'z-[99]' : 'z-[200]'}`}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
        aria-expanded={isOpen}
        aria-controls="fullscreen-nav"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{   rotate:  90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0,  opacity: 1 }}
              exit={{   rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel fullscreen ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="fullscreen-nav"
            key="fullscreen-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1,  y: 0,   scale: 1    }}
            exit={{   opacity: 0,  y: -12,  scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100] flex flex-col lg:hidden bg-gradient-to-b from-[#131850] via-[#0e1240] to-[#0a0d2e] safe-area-top safe-area-bottom"
          >
            {/*
              ── Header del overlay ────────────────────────────────────────
              z-[102] garantiza que el botón X interno sea siempre clickeable.
              Este es el ÚNICO botón X dentro del overlay — el del navbar queda
              oculto detrás del overlay cuando está abierto.
            */}
            <div className="relative z-[102] flex items-center justify-between px-5 py-4 border-b border-white/10">
              <NavLink
                to="/"
                onPointerDown={close}
                className="flex items-center gap-2.5"
                aria-label="Ir al inicio"
              >
                <img src="/images/logo-256.webp" alt="Pessaro Capital" className="h-8 w-auto" />
                <span className="text-white font-bold text-sm tracking-widest uppercase">
                  Pessaro Capital
                </span>
              </NavLink>

              {/* X para cerrar — onPointerDown fix iOS Safari */}
              <button
                type="button"
                onPointerDown={handleClose}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/30 transition-colors [touch-action:manipulation]"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Nav links ── */}
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col justify-center px-6 py-4 overflow-y-auto"
              aria-label="Menú principal"
            >
              {NAV_ITEMS.map(({ href, label }) => (
                <motion.div key={href} variants={itemVariants}>
                  <NavLink
                    to={href}
                    end={href === '/'}
                    onPointerDown={close}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-[14px] border-b border-white/[0.07]
                       text-[1.25rem] font-semibold tracking-tight transition-colors duration-200 group
                       ${isActive ? 'text-[#00c077]' : 'text-white/55 hover:text-white'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{label}</span>
                        <ArrowRight className={`w-[18px] h-[18px] transition-all duration-200
                          ${isActive
                            ? 'opacity-100 text-[#00c077]'
                            : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>

            {/*
              ── Footer: CTAs ─────────────────────────────────────────────
              z-[102] para que el dropdown de LoginMenu quede por encima del
              fondo del overlay.
            */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.3 }}
              className="relative z-[102] px-5 pt-5 pb-8 border-t border-white/10 space-y-3"
            >
              {/*
                ── Abrir Cuenta ─────────────────────────────────────────────
                Bug fix: NO usar useRiskProfile aquí.
                Se llama onOpenAccount() que ejecuta setShowProfileModal(true)
                en el contexto del Layout donde sí está el RiskProfileModal.
              */}
              <Button
                type="button"
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl
                           bg-gradient-to-r from-[#7c3aed] to-[#9d5cf6]
                           hover:from-[#6d28d9] hover:to-[#8b4ef5]
                           active:scale-[0.98] transition-all duration-200
                           [touch-action:manipulation]"
                onClick={() => {
                  close();
                  onOpenAccount();
                }}
              >
                Abrir Cuenta
              </Button>

              {/*
                ── Login dropdown ───────────────────────────────────────────
                Bug fix: el dropdown debe desplegarse HACIA ARRIBA (dropUp)
                porque el botón está en el footer del overlay y no hay espacio
                debajo — si se despliega hacia abajo, queda fuera de pantalla
                y provoca scroll.
                Se pasa dropUp={true} a LoginMenu para que use
                `bottom-full mb-2` en vez de `top-full mt-2`.
              */}
              <div className="flex justify-stretch">
                <LoginMenu
                  onMenuItemClick={close}
                  dropUp={true}
                  className="w-full [&>button]:w-full [&>button]:justify-center"
                />
              </div>

              <p className="text-center text-white/25 text-xs pt-1">
                ¿Primera vez?{' '}
                <NavLink
                  to="/servicios"
                  onPointerDown={close}
                  className="text-[#00c077]/80 hover:text-[#00c077] transition-colors underline underline-offset-2"
                >
                  Conoce nuestros servicios
                </NavLink>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
