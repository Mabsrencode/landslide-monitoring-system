"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const Content = () => {
  const router = useRouter();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [validCode, setValidCode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const newPassword = watch("newPassword");

  useEffect(() => {
    const verifyCode = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("oobCode");

        if (!code) {
          throw new Error("Invalid reset link");
        }

        setOobCode(code);
        setValidCode(true);
      } catch (error: unknown) {
        setValidCode(false);
        if (error instanceof Error) {
          toast.error(error.message || "Invalid or expired reset link");
        } else {
          toast.error("Invalid or expired reset link");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyCode();
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!oobCode) {
        throw new Error("Invalid reset code");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oobCode,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/auth/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg border border-black/20 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (validCode === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg border border-black/20 w-full max-w-md text-center">
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
          <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="mb-4">
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-primary hover:underline"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg border border-black/20 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
          >
            {mutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Content;
