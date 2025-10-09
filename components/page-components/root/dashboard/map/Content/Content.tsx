"use client";
import Section from "@/components/reusable/Section/Section";
import React from "react";
import MapComponent from "@/components/reusable/Map";
import { useAuthStore } from "@/stores/authStore";
const Content = () => {
  const { user } = useAuthStore();
  return (
    <Section>
      <h3 className="text-3xl manrope text-center mt-4">
        {user && user.role === "admin" ? "Device Locations" : "At risk place"}
      </h3>
      <div className="mt-2 h-[600px] w-[80%] mx-auto ">
        <MapComponent />
      </div>
    </Section>
  );
};

export default Content;
