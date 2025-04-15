"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import images from "@/constants/images";
import Link from "next/link";

const login = async (data: FormData) => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

const Content = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login success:", data);
      alert("Logged in!");
    },
    onError: (err) => {
      alert(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <section className="flex h-screen justify-between">
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
          src={images.login_banner}
          fill
          alt="banner"
          quality={100}
          className="w-full h-full object-cover fixed left-0 top-0"
        />
      </div>
      <div className="w-full md:w-1/2 p-4">
        <div className="block md:hidden fixed top-0 left-0 w-full h-full">
          <div className="bg-black/60 w-full h-full fixed z-10 top-0 left-0"></div>
          <Image
            src={images.login_banner}
            fill
            alt="banner"
            quality={100}
            className="w-full h-full object-cover"
          />
        </div>
        <Image
          src={images.logo}
          alt="logo"
          height={100}
          width={100}
          className="mx-auto"
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-6 rounded bg-white z-[1000] relative md:mt-12"
        >
          <Image
            src={images.logo}
            alt="logo"
            height={60}
            width={60}
            className="mx-auto block md:hidden"
          />
          <label className="flex flex-col manrope font-semibold text-sm">
            Username or Email
            <input
              type="text"
              {...register("identity", {
                required: "Username or Email is required",
              })}
              className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
            />
            {errors.identity && (
              <span className="text-red-500 text-sm">
                {errors.identity.message}
              </span>
            )}
          </label>

          <label className="flex flex-col manrope font-semibold text-sm">
            Password
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="border border-black/20 outline-none p-2  font-normal mt-2 bg-slate-100"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </label>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2 items-center">
              <input type="checkbox" id="remember_me" />{" "}
              <label htmlFor="remember_me" className="manrope text-xs">
                Remember me
              </label>
            </div>
            <Link
              href={"/forgot-password"}
              className="manrope text-xs font-semibold underline"
            >
              Forgot Password
            </Link>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="button disabled:opacity-50 text-white"
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Content;
