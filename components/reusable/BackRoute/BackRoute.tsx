"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
const BackRoute = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="bg-primary px-3 py-1 text-sm rounded self-start mb-12 font-medium text-white flex items-center gap-1 cursor-pointer"
    >
      <IoIosArrowBack /> Back
    </button>
  );
};

export default BackRoute;
