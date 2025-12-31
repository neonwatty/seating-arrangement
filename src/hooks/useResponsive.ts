import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook to detect current breakpoint using CSS media queries.
 * Uses matchMedia which is more reliable than window.innerWidth in headless browsers.
 */
export function useBreakpoint(): Breakpoint {
  const getBreakpoint = (): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop';
    // Use matchMedia for reliable detection in headless browsers
    if (window.matchMedia('(max-width: 767px)').matches) return 'mobile';
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
    return 'desktop';
  };

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    // Create media query lists
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(max-width: 1023px)');

    const updateBreakpoint = () => {
      if (mobileQuery.matches) {
        setBreakpoint('mobile');
      } else if (tabletQuery.matches) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Check immediately on mount
    updateBreakpoint();

    // Listen for media query changes
    mobileQuery.addEventListener('change', updateBreakpoint);
    tabletQuery.addEventListener('change', updateBreakpoint);

    return () => {
      mobileQuery.removeEventListener('change', updateBreakpoint);
      tabletQuery.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return breakpoint;
}

/**
 * Hook to check if device is mobile-sized
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
}

/**
 * Hook to check if device is tablet-sized
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'tablet';
}

/**
 * Hook to check if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    // Also check for coarse pointer (touch screens)
    const mediaQuery = window.matchMedia('(pointer: coarse)');

    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isTouch;
}

/**
 * Hook to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Generic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook to get viewport dimensions
 */
export function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export type Orientation = 'portrait' | 'landscape';

/**
 * Hook to detect device orientation.
 * Returns 'landscape' when width > height, 'portrait' otherwise.
 */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    // Listen for resize events (covers orientation changes)
    window.addEventListener('resize', handleOrientationChange);

    // Also listen for orientation change events (mobile-specific)
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if device is in mobile landscape mode.
 * This is specifically for phones rotated to landscape -
 * characterized by landscape orientation AND short viewport height.
 *
 * Mobile landscape typically has:
 * - Height under 500px (phone screens are narrow)
 * - Width greater than height
 * - Touch capability
 */
export function useMobileLandscape(): boolean {
  const orientation = useOrientation();
  const { height } = useViewportSize();
  const isTouch = useIsTouchDevice();

  // Mobile landscape: landscape orientation, short height, touch device
  // Height threshold of 500px catches most phones in landscape
  // but excludes tablets which have taller landscape heights
  return orientation === 'landscape' && height < 500 && isTouch;
}

/**
 * Hook for comprehensive mobile layout detection.
 * Returns layout mode considering both breakpoint and orientation.
 */
export function useMobileLayout(): {
  isMobile: boolean;
  isLandscape: boolean;
  isMobileLandscape: boolean;
  layoutMode: 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop';
} {
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();
  const isMobileLandscape = useMobileLandscape();

  const isMobile = breakpoint === 'mobile' || isMobileLandscape;
  const isLandscape = orientation === 'landscape';

  let layoutMode: 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop';
  if (isMobileLandscape) {
    layoutMode = 'mobile-landscape';
  } else if (breakpoint === 'mobile') {
    layoutMode = 'mobile-portrait';
  } else if (breakpoint === 'tablet') {
    layoutMode = 'tablet';
  } else {
    layoutMode = 'desktop';
  }

  return { isMobile, isLandscape, isMobileLandscape, layoutMode };
}
