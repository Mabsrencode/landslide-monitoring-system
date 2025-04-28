import { useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export const useRecaptcha = () => {
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const loadRecaptcha = () => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setRecaptchaLoaded(true);
      document.body.appendChild(script);
    };

    if (!window.grecaptcha) {
      loadRecaptcha();
    } else {
      setRecaptchaLoaded(true);
    }
  }, []);

  const getRecaptchaToken = async (action: string) => {
    if (!recaptchaLoaded) {
      throw new Error("reCAPTCHA not loaded yet");
    }

    return new Promise<string>((resolve, reject) => {
      window.grecaptcha?.ready(async () => {
        try {
          if (window.grecaptcha) {
            const token = await window.grecaptcha.execute(
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
              { action }
            );
            resolve(token);
          } else {
            reject(new Error("reCAPTCHA not available"));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  return { getRecaptchaToken, recaptchaLoaded };
};
