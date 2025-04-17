"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [error, setError] = useState<string | null>(null);

  const verifyEmailMutation = useMutation({
    mutationFn: async (oobCode: string) => {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oobCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Verification failed");
      }

      return data;
    },
    onSuccess: () => {
      setStatus("success");
    },
    onError: (err) => {
      setStatus("error");
      setError(err.message || "Email verification failed");
    },
  });
  const verify = useCallback(() => {
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setStatus("error");
      setError("Invalid verification link");
      return;
    }

    verifyEmailMutation.mutate(oobCode);
  }, [searchParams, verifyEmailMutation]);

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg border border-black/20 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Email Verification
        </h1>

        {status === "verifying" && (
          <div className="text-center">
            <p>Verifying your email address...</p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mb-4">Your email has been successfully verified!</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-primary text-white py-2 rounded mt-4"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="mb-4 text-red-500">{error}</p>
            <Link href="/auth/login">
              <button className="w-full bg-primary text-white py-2 rounded mt-4">
                Return to Login
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
