import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  supportsParallax: boolean;
  isLowEndDevice: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    supportsParallax: true,
    isLowEndDevice: false,
    prefersReducedMotion: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const checkCapabilities = () => {
      // Detectar preferencia de movimiento reducido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detectar tipo de dispositivo
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                      (window.innerWidth >= 768 && window.innerWidth <= 1024);
      const isDesktop = !isMobile && !isTablet;

      // Detectar dispositivos de gama baja
      let isLowEndDevice = false;
      
      // Verificar memoria disponible (si está disponible)
      if ('deviceMemory' in navigator) {
        const deviceMemory = (navigator as any).deviceMemory;
        isLowEndDevice = deviceMemory <= 2; // 2GB o menos
      }

      // Verificar número de núcleos del procesador
      if ('hardwareConcurrency' in navigator) {
        const cores = navigator.hardwareConcurrency;
        if (cores <= 2) {
          isLowEndDevice = true;
        }
      }

      // Verificar conexión de red (si está disponible)
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          isLowEndDevice = true;
        }
      }

      // Detectar si es un dispositivo iOS (problemas conocidos con parallax)
      const isIOS = /ipad|iphone|ipod/.test(userAgent);
      
      // Determinar si soporta parallax
      const supportsParallax = !prefersReducedMotion && 
                              !isLowEndDevice && 
                              !isIOS && // iOS tiene problemas de rendimiento con parallax
                              isDesktop; // Solo habilitar en desktop por defecto

      setCapabilities({
        supportsParallax,
        isLowEndDevice,
        prefersReducedMotion,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    checkCapabilities();

    // Escuchar cambios en la preferencia de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => checkCapabilities();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores más antiguos
      mediaQuery.addListener(handleChange);
    }

    // Escuchar cambios de orientación/tamaño de pantalla
    window.addEventListener('resize', checkCapabilities);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener('resize', checkCapabilities);
    };
  }, []);

  return capabilities;
};

// Hook para configuración automática de parallax basada en capacidades del dispositivo
export const useOptimizedParallax = (baseSpeed: number = 0.5) => {
  const capabilities = useDeviceCapabilities();
  
  const getOptimizedSettings = () => {
    if (!capabilities.supportsParallax) {
      return {
        disabled: true,
        speed: 0,
      };
    }

    if (capabilities.isLowEndDevice) {
      return {
        disabled: false,
        speed: baseSpeed * 0.3, // Reducir velocidad en dispositivos de gama baja
      };
    }

    if (capabilities.isTablet) {
      return {
        disabled: false,
        speed: baseSpeed * 0.6, // Velocidad moderada en tablets
      };
    }

    return {
      disabled: false,
      speed: baseSpeed, // Velocidad completa en desktop
    };
  };

  return {
    ...capabilities,
    ...getOptimizedSettings(),
  };
};