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

const login = async (data: FormData) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }
  const result = await response.json();
  return result;
};

const Content = () => {
  const router = useRouter();
  const [seePassword, setSeePassword] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success(data.message);
      router.refresh();
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message || "Something went wrong");
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
          placeholder="blur"
          blurDataURL={images.login_banner}
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
            placeholder="blur"
            blurDataURL={images.login_banner}
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
          <label className="flex flex-col manrope font-semibold text-sm relative">
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
            <Link
              href={"/forgot-password"}
              className="manrope text-xs font-semibold underline text-gray-600 hover:text-black transition-all"
            >
              Forgot Password
            </Link>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="button disabled:opacity-50 text-white transition-all"
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </button>
          <p className="text-xs text-right text-gray-600">
            Don&apos;t Have An Account?{" "}
            <Link
              className="text-primary font-semibold hover:underline"
              href={"/auth/register"}
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Content;
