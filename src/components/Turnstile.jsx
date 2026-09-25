import { useEffect, useRef } from "react";

let turnstileScript;

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScript) return turnstileScript;

  turnstileScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Unable to load security verification"));
    document.head.appendChild(script);
  });

  return turnstileScript;
}

const Turnstile = ({ onTokenChange, resetSignal }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;
    let isMounted = true;

    loadTurnstileScript()
      .then((turnstile) => {
        if (!isMounted || !turnstile || widgetIdRef.current !== null) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          callback: onTokenChange,
          "expired-callback": () => onTokenChange(""),
          "error-callback": () => onTokenChange(""),
        });
      })
      .catch(() => onTokenChange(""));

    return () => {
      isMounted = false;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, siteKey]);

  useEffect(() => {
    if (resetSignal && window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return <p className="text-sm font-medium text-red-700">Security verification is unavailable. Please try again later.</p>;
  }

  return <div ref={containerRef} className="min-h-[65px]" aria-label="Security verification" />;
};

export default Turnstile;
