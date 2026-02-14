import { useEffect, useState, useCallback, useRef } from 'react';

interface ParallaxOptions {
  speed?: number;
  offset?: number;
  disabled?: boolean;
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.5, offset = 0, disabled = false } = options;
  const [transform, setTransform] = useState('translateY(0px)');
  const elementRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>();
  const lastScrollY = useRef(0);

  const updateTransform = useCallback(() => {
    if (disabled || !elementRef.current) return;

    const scrollY = window.scrollY;
    const elementTop = elementRef.current.offsetTop;
    const elementHeight = elementRef.current.offsetHeight;
    const windowHeight = window.innerHeight;

    // Solo aplicar parallax si el elemento está visible
    if (scrollY + windowHeight > elementTop && scrollY < elementTop + elementHeight) {
      const yPos = -(scrollY - elementTop + offset) * speed;
      setTransform(`translateY(${yPos}px)`);
    }

    lastScrollY.current = scrollY;
  }, [speed, offset, disabled]);

  const handleScroll = useCallback(() => {
    // Usar requestAnimationFrame para optimizar el rendimiento
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(updateTransform);
  }, [updateTransform]);

  useEffect(() => {
    if (disabled) return;

    // Throttle scroll events para mejor rendimiento
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    
    // Calcular posición inicial
    updateTransform();

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, updateTransform, disabled]);

  return { elementRef, transform };
};

// Hook para parallax múltiple optimizado
export const useMultiParallax = (elements: ParallaxOptions[] = []) => {
  const [transforms, setTransforms] = useState<string[]>([]);
  const elementRefs = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number>();

  const updateTransforms = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const newTransforms: string[] = [];

    elements.forEach((options, index) => {
      const { speed = 0.5, offset = 0, disabled = false } = options;
      const element = elementRefs.current[index];

      if (disabled || !element) {
        newTransforms.push('translateY(0px)');
        return;
      }

      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;

      // Solo aplicar parallax si el elemento está visible
      if (scrollY + windowHeight > elementTop && scrollY < elementTop + elementHeight) {
        const yPos = -(scrollY - elementTop + offset) * speed;
        newTransforms.push(`translateY(${yPos}px)`);
      } else {
        newTransforms.push('translateY(0px)');
      }
    });

    setTransforms(newTransforms);
  }, [elements]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(updateTransforms);
  }, [updateTransforms]);

  useEffect(() => {
    let ticking = false;
    
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    
    // Calcular posiciones iniciales
    updateTransforms();

    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, updateTransforms]);

  const setElementRef = useCallback((index: number) => (ref: HTMLElement | null) => {
    elementRefs.current[index] = ref;
  }, []);

  return { setElementRef, transforms };
};

// Hook para scroll suave optimizado
export const useSmoothScroll = () => {
  const scrollTo = useCallback((target: string | number, offset: number = 0) => {
    let targetPosition: number;

    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) return;
      targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    } else {
      targetPosition = target - offset;
    }

    // Usar scroll nativo optimizado
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }, []);

  return { scrollTo };
};

// Hook para detectar dirección de scroll
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      setScrollY(currentScrollY);
      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollDirection, scrollY };
};