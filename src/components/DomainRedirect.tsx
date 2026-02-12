import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { redirectToCorrectDomain, isDevelopment, enforceLoginDomainRoutes } from '@/lib/domains';

/**
 * Componente que maneja las redirecciones automáticas entre dominios
 * Se ejecuta en cada cambio de ruta para asegurar que el usuario esté en el dominio correcto
 */
const DomainRedirect: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Solo ejecutar redirecciones en producción
    if (!isDevelopment()) {
      redirectToCorrectDomain(location.pathname);
      // Aplicar lógica estricta para el dominio de login
      enforceLoginDomainRoutes(location.pathname);
    }
  }, [location.pathname]);

  // Este componente no renderiza nada
  return null;
};

export default DomainRedirect;