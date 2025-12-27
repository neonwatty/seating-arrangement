// Type declarations for Google Analytics gtag.js
declare global {
  interface Window {
    gtag: Gtag.Gtag;
    dataLayer: unknown[];
  }
}

declare namespace Gtag {
  type Gtag = (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: ConfigParams | EventParams | CustomParams
  ) => void;

  interface ConfigParams {
    page_title?: string;
    page_location?: string;
    page_path?: string;
    send_page_view?: boolean;
    [key: string]: unknown;
  }

  interface EventParams {
    event_category?: string;
    event_label?: string;
    value?: number;
    send_to?: string;
    currency?: string;
    [key: string]: unknown;
  }

  interface CustomParams {
    [key: string]: unknown;
  }
}

export {};
