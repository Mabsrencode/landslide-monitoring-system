"use client";
import Section from "@/components/reusable/Section/Section";
import React from "react";
import MapComponent from "@/components/reusable/Map";
const Content = () => {
  return (
    <Section>
      <h3 className="text-3xl manrope text-center mt-4">Detector locations</h3>
      <div className="mt-2 h-[600px] w-[80%] mx-auto ">
        <MapComponent />
      </div>
    </Section>
  );
};

export default Content;
