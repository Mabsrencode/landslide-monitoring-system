"use client";

import environment from "@/constants/environment";
import { useEffect } from "react";

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

export const RecaptchaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha) return;

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadRecaptcha();

    return () => {};
  }, []);

  return <>{children}</>;
};
