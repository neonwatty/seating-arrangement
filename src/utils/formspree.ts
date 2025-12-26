const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkongbre';

export async function submitEmail(
  email: string,
  utmParams?: Record<string, string | null>
): Promise<{ ok: boolean }> {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      ...utmParams,
      source: 'seatify_app',
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit email');
  }

  return response.json();
}
