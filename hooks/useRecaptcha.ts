"use client";

import { useState, useEffect } from "react";

export const useRecaptcha = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha) {
        setIsReady(true);
      }
    };
    checkRecaptcha();
    const interval = setInterval(checkRecaptcha, 100);

    return () => clearInterval(interval);
  }, []);

  const getToken = async (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isReady) {
        reject(new Error("reCAPTCHA not ready"));
        return;
      }

      window.grecaptcha?.ready(async () => {
        try {
          if (!window.grecaptcha) {
            reject(new Error("reCAPTCHA not available"));
            return;
          }

          const token = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action }
          );
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  return { getToken, isReady };
};
