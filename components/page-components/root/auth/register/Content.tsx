"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import images from "@/constants/images";
import Link from "next/link";
import icons from "@/constants/icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Content = () => {
  const router = useRouter();
  const [seePassword, setSeePassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormDataRegister>();
  const password = watch("password");
  const email = watch("email");
  const mutation = useMutation({
    mutationFn: async (data: FormDataRegister) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || "Register failed");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.requiresVerification) {
        setVerificationSent(true);
        toast.success(data.message);
      } else {
        toast.success("Registration successful!");
        router.push("/");
      }
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Registration failed");
    },
  });
  const resendVerification = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Resending verification email failed"
        );
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Resending verification email failed");
    },
  });

  const onSubmit = (data: FormDataRegister) => {
    mutation.mutate(data);
  };

  return (
    <section className="flex h-screen justify-between">
      {verificationSent && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center w-full h-full">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Verify Your Email</h2>
            <p className="mb-4">
              We&apos;ve sent a verification link to your email address. Please
              check your inbox and click the link to complete registration.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Didn&apos;t receive the email? Check your spam folder or
              <button
                onClick={() => resendVerification.mutate({ email, password })}
                className="text-blue-500 ml-1 flex gap-2 items-center"
              >
                resend verification email
                {resendVerification.isPending && (
                  <span className="h-[12px] w-[12px] border-2 border-gray-700 rounded-full block border-t-white animate-spin"></span>
                )}
              </button>
            </p>
            <button
              onClick={() => {
                setVerificationSent(false);
                router.push("/auth/login");
              }}
              className="w-full bg-primary text-white py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="hidden md:flex justify-center items-center w-1/2 h-full relative">
        <div className="bg-black/70 w-full h-full absolute z-10 top-0 left-0"></div>
        <div className="z-10 relative text-white px-8">
          <h1 className="manrope text-7xl text-center font-bold uppercase">
            Bantay
          </h1>
          <p className="text-gray-300 text-sm text-center mt-2">
            Bantay is a landslide monitoring system designed to provide early
            warnings and real-time data on slope stability. By utilizing
            sensors, data analytics, and alerts, Bantay helps communities and
            authorities detect potential landslides, enhancing disaster
            preparedness and minimizing risks to lives and property.
          </p>
        </div>
        <Image
          placeholder="blur"
          blurDataURL={images.login_banner}
          src={images.login_banner}
          fill
          alt="banner"
          quality={100}
          className="w-full h-full object-cover fixed left-0 top-0"
        />
      </div>
      <div className="w-full md:w-1/2 p-4 overflow-y-auto">
        <div className="block md:hidden fixed top-0 left-0 w-full h-full">
          <div className="bg-black/60 w-full h-full fixed z-10 top-0 left-0"></div>
          <Image
            placeholder="blur"
            blurDataURL={images.login_banner}
            src={images.login_banner}
            fill
            alt="banner"
            quality={100}
            className="w-full h-full object-cover"
          />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 rounded bg-white z-[1000] relative"
        >
          <div>
            <h2 className="manrope text-3xl font-bold">Register</h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to BANTAY enhancing disaster preparedness and minimizing
              risks to lives and property.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <label className="flex flex-col manrope font-semibold text-sm relative w-full">
              Email
              <input
                type="text"
                placeholder="example@gmail.com"
                {...register("email", {
                  required: "Email is required",
                })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
              />
              {errors.email && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.email.message}
                </span>
              )}
            </label>
            <label className="flex flex-col manrope font-semibold text-sm relative w-full">
              Username
              <input
                type="text"
                placeholder="Username"
                {...register("username", {
                  required: "Username is required",
                })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
              />
              {errors.username && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.username.message}
                </span>
              )}
            </label>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-ful">
            <label className="flex flex-col manrope font-semibold text-sm relative w-full">
              First Name
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName", {
                  required: "First Name is required",
                })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
              />
              {errors.firstName && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.firstName.message}
                </span>
              )}
            </label>
            <label className="flex flex-col manrope font-semibold text-sm relative w-full">
              Last Name
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName", {
                  required: "Last Name is required",
                })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
              />
              {errors.lastName && (
                <span className="text-red-500 text-xs font-semibold">
                  {errors.lastName.message}
                </span>
              )}
            </label>
          </div>
          <label className="flex flex-col manrope font-semibold text-sm relative w-full">
            Contact Number
            <input
              type="text"
              placeholder="Contact Number"
              {...register("contactNumber", {
                required: "Contact Number is required",
              })}
              className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
            />
            {errors.contactNumber && (
              <span className="text-red-500 text-xs font-semibold">
                {errors.contactNumber.message}
              </span>
            )}
          </label>
          <label className="flex flex-col manrope font-semibold text-sm">
            Password
            <div className="relative w-full">
              <input
                type={seePassword ? "text" : "password"}
                placeholder="**************"
                {...register("password", { required: "Password is required" })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100 w-full"
              />
              {seePassword ? (
                <icons.eyes.on
                  className="absolute text-xl top-[17] right-2 cursor-pointer"
                  onClick={() => setSeePassword(!seePassword)}
                />
              ) : (
                <icons.eyes.off
                  className="absolute text-xl top-[17] right-2 cursor-pointer"
                  onClick={() => setSeePassword(!seePassword)}
                />
              )}
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs font-semibold">
                {errors.password.message}
              </span>
            )}
          </label>
          <label className="flex flex-col manrope font-semibold text-sm">
            Confirm Password
            <div className="relative w-full">
              <input
                type={seePassword ? "text" : "password"}
                placeholder="**************"
                {...register("cpassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100 w-full"
              />
            </div>
            {errors.cpassword && (
              <span className="text-red-500 text-xs font-semibold">
                {errors.cpassword.message}
              </span>
            )}
          </label>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2 items-center">
              <input type="checkbox" id="remember_me" />{" "}
              <label
                htmlFor="remember_me"
                className="manrope text-xs font-semibold text-gray-600 hover:text-black transition-all"
              >
                Remember me
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="button disabled:opacity-50 text-white transition-all"
          >
            {mutation.isPending ? "Registering..." : "Register"}
          </button>
          <p className="text-xs text-right text-gray-600">
            Already Have An Account?{" "}
            <Link
              className="text-primary font-semibold hover:underline"
              href={"/auth/login"}
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Content;
