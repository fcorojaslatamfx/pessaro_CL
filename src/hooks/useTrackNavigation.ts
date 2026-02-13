import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTrackNavigation = () => {
  const location = useLocation();

  useEffect(() => {
    // Guardar la URL actual en sessionStorage para poder rastrear de dónde viene el usuario
    // si llega a la página de error
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      
      // Solo guardar si no estamos ya en la página de error
      if (!location.pathname.includes('/error')) {
        sessionStorage.setItem('lastVisitedUrl', currentUrl);
      }
    }
  }, [location]);
};