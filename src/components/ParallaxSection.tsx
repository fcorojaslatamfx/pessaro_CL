import React, { forwardRef, ReactNode, useRef, useCallback } from 'react';
import { useParallax } from '@/hooks/useParallax';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export const ParallaxSection = forwardRef<HTMLDivElement, ParallaxSectionProps>(
  ({ children, speed = 0.5, offset = 0, disabled = false, className = '', style = {}, as: Component = 'div' }, ref) => {
    const { elementRef, transform } = useParallax({ speed, offset, disabled });

    // Combinar refs si se pasa uno externo
    const combinedRef = useCallback((node: HTMLDivElement | null) => {
      // Asignar al ref interno del parallax
      if (elementRef) {
        elementRef.current = node;
      }
      // Asignar al ref externo si existe
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    }, [elementRef, ref]);

    const ComponentToRender = Component as any;

    return (
      <ComponentToRender
        ref={combinedRef}
        className={className}
        style={{
          ...style,
          transform: disabled ? undefined : transform,
          willChange: disabled ? undefined : 'transform',
        }}
      >
        {children}
      </ComponentToRender>
    );
  }
);

ParallaxSection.displayName = 'ParallaxSection';

// Componente para imágenes de fondo con parallax
interface ParallaxBackgroundProps {
  src: string;
  alt?: string;
  speed?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  src,
  alt = '',
  speed = 0.3,
  offset = 0,
  disabled = false,
  className = '',
  overlay = false,
  overlayColor = 'black',
  overlayOpacity = 0.4,
}) => {
  const { elementRef, transform } = useParallax({ speed, offset, disabled });
  const imgRef = useRef<HTMLImageElement>(null);

  // Combinar refs para la imagen
  const combinedImgRef = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (elementRef) {
      elementRef.current = node;
    }
  }, [elementRef]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        ref={combinedImgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: disabled ? undefined : transform,
          willChange: disabled ? undefined : 'transform',
          height: '120%', // Extender para cubrir el movimiento parallax
          top: '-10%',
        }}
        loading="lazy"
        decoding="async"
      />
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </div>
  );
};

// Componente para texto con parallax
interface ParallaxTextProps {
  children: ReactNode;
  speed?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({
  children,
  speed = 0.2,
  offset = 0,
  disabled = false,
  className = '',
}) => {
  const { elementRef, transform } = useParallax({ speed, offset, disabled });
  const divRef = useRef<HTMLDivElement>(null);

  // Combinar refs para el div
  const combinedDivRef = useCallback((node: HTMLDivElement | null) => {
    divRef.current = node;
    if (elementRef) {
      elementRef.current = node;
    }
  }, [elementRef]);

  return (
    <div
      ref={combinedDivRef}
      className={className}
      style={{
        transform: disabled ? undefined : transform,
        willChange: disabled ? undefined : 'transform',
      }}
    >
      {children}
    </div>
  );
};

// Componente para elementos flotantes con parallax
interface ParallaxFloatingProps {
  children: ReactNode;
  speed?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
  direction?: 'up' | 'down';
}

export const ParallaxFloating: React.FC<ParallaxFloatingProps> = ({
  children,
  speed = 0.1,
  offset = 0,
  disabled = false,
  className = '',
  direction = 'up',
}) => {
  const adjustedSpeed = direction === 'down' ? -speed : speed;
  const { elementRef, transform } = useParallax({ speed: adjustedSpeed, offset, disabled });
  const divRef = useRef<HTMLDivElement>(null);

  // Combinar refs para el div
  const combinedDivRef = useCallback((node: HTMLDivElement | null) => {
    divRef.current = node;
    if (elementRef) {
      elementRef.current = node;
    }
  }, [elementRef]);

  return (
    <div
      ref={combinedDivRef}
      className={className}
      style={{
        transform: disabled ? undefined : transform,
        willChange: disabled ? undefined : 'transform',
      }}
    >
      {children}
    </div>
  );
};