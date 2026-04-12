import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { loadRecaptcha, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

interface RecaptchaProps {
  /** Called when Google returns a successful token */
  onVerify: (token: string) => void;
  /** Called if the user closes the puzzle, the token expires, or an error occurs */
  onError?: () => void;
  /** Where the floating badge sits — defaults to bottom-left */
  badge?: "bottomright" | "bottomleft" | "inline";
}

export interface RecaptchaHandle {
  /** Trigger the invisible captcha. Google may show a puzzle, or pass silently. */
  execute: () => void;
  /** Reset the widget after a successful submit */
  reset: () => void;
}

/**
 * Invisible reCAPTCHA v2.
 * Renders only a floating badge — no checkbox. Call ref.execute() on form submit.
 */
const Recaptcha = forwardRef<RecaptchaHandle, RecaptchaProps>(
  ({ onVerify, onError, badge = "bottomleft" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    useEffect(() => {
      if (!RECAPTCHA_SITE_KEY) return;
      let cancelled = false;

      loadRecaptcha()
        .then(() => {
          if (cancelled || !containerRef.current || !window.grecaptcha) return;
          if (widgetIdRef.current !== null) return;

          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY!,
            size: "invisible",
            badge,
            callback: (token: string) => onVerify(token),
            "expired-callback": () => onError?.(),
            "error-callback": () => onError?.(),
          });
        })
        .catch(() => {
          onError?.();
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      execute: () => {
        if (!RECAPTCHA_SITE_KEY) {
          // No keys configured — just resolve immediately so the form still works
          onVerify("");
          return;
        }
        if (widgetIdRef.current !== null && window.grecaptcha) {
          window.grecaptcha.execute(widgetIdRef.current);
        }
      },
      reset: () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      },
    }));

    return <div ref={containerRef} />;
  }
);

Recaptcha.displayName = "Recaptcha";

export default Recaptcha;
