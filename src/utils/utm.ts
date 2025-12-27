// UTM Parameter Tracking
// Captures and stores UTM parameters for attribution

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

/**
 * Capture UTM parameters from the URL and store in sessionStorage
 * This should be called on the landing page load
 */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utmParams: UtmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };

  // Only store if at least one UTM param is present
  if (Object.values(utmParams).some((v) => v)) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}

/**
 * Get stored UTM parameters
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const stored = sessionStorage.getItem('utm_params');
  return stored
    ? JSON.parse(stored)
    : {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
      };
}

/**
 * Clear stored UTM parameters
 */
export function clearUtmParams(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('utm_params');
  }
}
