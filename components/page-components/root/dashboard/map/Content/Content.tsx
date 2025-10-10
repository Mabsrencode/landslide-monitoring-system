"use client";
import Section from "@/components/reusable/Section/Section";
import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase/firebase-client";
import { onValue, ref } from "firebase/database";
import MapComponent from "@/components/reusable/Map";
import { useAuthStore } from "@/stores/authStore";
const Content = () => {
  const { user } = useAuthStore();
  const [sensorData, setSensorData] = useState<RealtimeSensorData>(null);

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
      <h3 className="text-3xl manrope text-center mt-4">
        {user && user.role === "admin" ? "Device Locations" : "At risk place"}
      </h3>
      {sensorData && sensorData.coordinates && (
        <div className="mt-2 h-[600px] w-[80%] mx-auto ">
          <MapComponent
            latitude={sensorData.coordinates.latitude}
            longitude={sensorData.coordinates.longitude}
            color={sensorData.warningLevel.color}
            title="Zone 1"
          />
        </div>
      )}
    </Section>
  );
};

export default Content;
