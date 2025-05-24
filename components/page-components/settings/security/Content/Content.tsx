"use client";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import React from "react";
import OthersLink from "../../OthersLink/OthersLink";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
import toast from "react-hot-toast";

const Content = () => {
  const { user } = useAuthStore();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePassFormTypes>();
  const {
    mutate: changePassword,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: async (data: ChangePassFormTypes) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          currentPassword: data.currentPassword,
          newPassword: data.password,
        }),
      });
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      reset();
    },
  });
  const onSubmit = (data: ChangePassFormTypes) => {
    changePassword(data);
  };
  if (!user) {
    return <SpinnerLoader variant="big" />;
  }
  return (
    <section className="container mx-auto p-4 w-full h-full">
      <BackRoute />
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex-1 md:w-1/2 mx-auto space-y-6 bg-slate-100 rounded p-4 border border-black/10"
        >
          <h4 className="text-4xl text-center font-semibold manrope text-primary">
            Change Password
          </h4>
          <div className="mt-4 grid gap-4">
            <div className="grid w-full gap-2">
              <label htmlFor="current_psw">Current Password</label>
              <input
                {...register("currentPassword", {
                  required: {
                    value: true,
                    message: "Current Password is required.",
                  },
                })}
                type="password"
                id="current_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
              {errors.currentPassword && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.currentPassword.message}
                </span>
              )}
            </div>
            <div className="grid w-full gap-2">
              <label htmlFor="new_psw">New Password</label>
              <input
                {...register("password", {
                  required: {
                    value: true,
                    message: "Password is required.",
                  },
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                id="new_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
              {errors.password && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className="grid w-full gap-2">
              <label htmlFor="confirm_psw">Confirm Password</label>
              <input
                {...register("cpassword", {
                  required: {
                    value: true,
                    message: "Confirm Password is required.",
                  },
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                type="password"
                id="confirm_psw"
                placeholder="*******************"
                className="w-full border disabled:cursor-not-allowed border-black/20 outline-none p-2  font-normal bg-white"
              />
              {errors.cpassword && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.cpassword.message}
                </span>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="button w-full text-white font-semibold disabled:hover:cursor-not-allowed disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <SpinnerLoader /> : "  Save"}
          </button>
          {error && (
            <div className="text-red-500 text-center">
              {error.message || "Failed to change password"}
            </div>
          )}
        </form>
        <OthersLink />
      </div>
    </section>
  );
};

export default Content;
