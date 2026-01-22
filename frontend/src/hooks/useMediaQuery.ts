import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries y tamaños de pantalla
 * Útil para diseño responsive
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hooks predefinidos para breakpoints comunes
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 640px)'); // sm
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)'); // md to lg
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)'); // lg+
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 1024px)'); // mobile + tablet
}
