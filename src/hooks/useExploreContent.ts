import { useState } from 'react';

export const useExploreContent = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openExplorePopup = () => {
    setIsPopupOpen(true);
  };

  const closeExplorePopup = () => {
    setIsPopupOpen(false);
  };

  const navigateToContent = (section: string, itemId?: string) => {
    // Función para navegar a diferentes secciones
    switch (section) {
      case 'rutas':
        if (itemId) {
          // Navegar a ruta específica en el contenido detallado
          const routeElement = document.getElementById(`route-${itemId}`);
          if (routeElement) {
            routeElement.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // Navegar a la sección de rutas
          const tabTrigger = document.querySelector('[value="rutas"]') as HTMLElement;
          tabTrigger?.click();
          setTimeout(() => {
            document.getElementById('rutas-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
        break;
        
      case 'base-conocimientos':
        // Navegar a base de conocimientos
        const baseTabTrigger = document.querySelector('[value="base-conocimientos"]') as HTMLElement;
        baseTabTrigger?.click();
        setTimeout(() => {
          document.getElementById('base-conocimientos')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
        
      case 'faq':
        // Navegar a FAQ
        const faqTabTrigger = document.querySelector('[value="faq"]') as HTMLElement;
        faqTabTrigger?.click();
        setTimeout(() => {
          if (itemId && itemId !== 'faq') {
            // Si hay una categoría específica, aplicar filtro
            const categoryBadges = document.querySelectorAll('[data-category]');
            categoryBadges.forEach(badge => {
              if (badge.textContent === itemId) {
                (badge as HTMLElement).click();
              }
            });
          }
          document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
        
      default:
        break;
    }
  };

  return {
    isPopupOpen,
    openExplorePopup,
    closeExplorePopup,
    navigateToContent
  };
};