import React, { useEffect } from 'react';
import { useSmoothScroll } from '@/hooks/useParallax';

interface SmoothScrollProps {
  children: React.ReactNode;
  offset?: number;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProps> = ({ 
  children, 
  offset = 80 
}) => {
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    // Interceptar clics en enlaces de ancla
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      
      if (target.tagName === 'A' && target.hash) {
        const href = target.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          e.preventDefault();
          scrollTo(href, offset);
        }
      }
    };

    // Manejar navegación por hash en la URL
    const handleHashChange = () => {
      if (window.location.hash) {
        setTimeout(() => {
          scrollTo(window.location.hash, offset);
        }, 100);
      }
    };

    // Scroll inicial si hay hash en la URL
    if (window.location.hash) {
      setTimeout(() => {
        scrollTo(window.location.hash, offset);
      }, 500);
    }

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [scrollTo, offset]);

  return <>{children}</>;
};

// Hook para scroll suave programático
export const useSmoothScrollTo = (offset: number = 80) => {
  const { scrollTo } = useSmoothScroll();

  const scrollToSection = (sectionId: string) => {
    scrollTo(`#${sectionId}`, offset);
  };

  const scrollToTop = () => {
    scrollTo(0, 0);
  };

  const scrollToElement = (element: HTMLElement) => {
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    scrollTo(targetPosition, 0);
  };

  return {
    scrollToSection,
    scrollToTop,
    scrollToElement,
    scrollTo: (target: string | number) => scrollTo(target, offset)
  };
};