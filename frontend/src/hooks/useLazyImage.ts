import { useEffect, useRef, useState } from 'react';

/**
 * Hook para lazy loading de imagenes
 * Carga la imagen solo cuando esta visible en el viewport
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Imagen visible, cargar la imagen real
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return { imgRef, imageSrc, isLoaded };
}

/**
 * Ejemplo de uso:
 * 
 * function MyComponent() {
 *   const { imgRef, imageSrc, isLoaded } = useLazyImage('/path/to/image.jpg', '/placeholder.jpg');
 *   
 *   return (
 *     <img
 *       ref={imgRef}
 *       src={imageSrc}
 *       alt="Description"
 *       className={isLoaded ? 'loaded' : 'loading'}
 *     />
 *   );
 * }
 */
