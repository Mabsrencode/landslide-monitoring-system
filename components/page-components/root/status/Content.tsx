"use client";
import Section from "@/components/reusable/Section/Section";
import { database } from "@/lib/firebase/firebase-client";
import { onValue, ref } from "firebase/database";

import React, { useEffect, useState } from "react";

const Content = () => {
  type NewType = {
    moisture: {
      value: number;
      timestamp: string;
    };
    rain: {
      value: number;
      timestamp: string;
    };
    vibration: {
      value: number;
      timestamp: string;
    };
    warningLevel: {
      color: string;
      message: string;
    };
  } | null;

  const [sensorData, setSensorData] = useState<NewType>(null);
  useEffect(() => {
    const dataRef = ref(database, "sensors/");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setSensorData(data);
    });

    return () => unsubscribe();
  }, []);
  return (
    <Section>
      <div
        className={`text-white text-2xl text-center px-4 py-2 rounded shadow bg-${sensorData?.warningLevel.color.toLowerCase()}-500`}
      >
        Landslide Risk Level:{" "}
        <strong>{sensorData?.warningLevel.message}</strong>
      </div>
      <div className="p-4 border border-black/20 rounded mt-6">
        <h3 className="font-semibold text-2xl manrope text-center">
          Current Sensor Data
        </h3>
        <ul className="mt-4 space-y-1 flex flex-col md:flex-row gap-2 w-full justify-center text-sm text-center">
          <li className="px-4 py-1 rounded bg-secondary text-white">
            💧 Moisture: {sensorData?.moisture.value ?? "N/A"}
          </li>
          <li className="px-4 py-1 rounded bg-secondary text-white">
            🌧️ Rain: {sensorData?.rain.value ?? "N/A"}
          </li>
          <li className="px-4 py-1 rounded bg-secondary text-white">
            ♒︎ Soil Vibration: {sensorData?.vibration.value ?? "N/A"}
          </li>
        </ul>
      </div>
    </Section>
  );
};

export default Content;
