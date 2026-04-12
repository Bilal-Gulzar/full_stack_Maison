/**
 * Client-side Google reCAPTCHA v2 ("I'm not a robot" checkbox) loader.
 * No-op if VITE_RECAPTCHA_SITE_KEY is unset.
 *
 * Used by <Recaptcha /> React component.
 */
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact" | "invisible";
          badge?: "bottomright" | "bottomleft" | "inline";
        }
      ) => number;
      execute: (widgetId?: number) => void;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

let loaderPromise: Promise<void> | null = null;

export function loadRecaptcha(): Promise<void> {
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha && window.grecaptcha.render) return resolve();

    window.onRecaptchaLoad = () => resolve();
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(s);
  });

  return loaderPromise;
}

// Preload on import so the script is ready by the time the user sees the form.
if (typeof window !== "undefined" && RECAPTCHA_SITE_KEY) {
  loadRecaptcha().catch(() => {});
}
