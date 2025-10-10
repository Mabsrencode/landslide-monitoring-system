"use client";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import Section from "@/components/reusable/Section/Section";
import { database } from "@/lib/firebase/firebase-client";
import { onValue, ref } from "firebase/database";
import MapComponent from "@/components/reusable/Map";
import React, { useEffect, useState } from "react";
import IncidentTable from "../dashboard/incidents/IncidentTable/IncidentTable";

const Content = () => {
  const [sensorData, setSensorData] = useState<RealtimeSensorData>(null);

  useEffect(() => {
    const dataRef = ref(database, "sensors/");
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setSensorData(data);
    });
    return () => unsubscribe();
  }, []);

  const latestTimestamp = sensorData
    ? new Date(
        Math.max(
          new Date(sensorData.moisture.timestamp).getTime(),
          new Date(sensorData.rain.timestamp).getTime(),
          new Date(sensorData.vibration.timestamp).getTime()
        )
      ).toLocaleString()
    : null;

  return (
    <Section>
      <BackRoute />
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

        {latestTimestamp && (
          <p className="text-center text-gray-400 text-sm mt-2">
            Last updated: {latestTimestamp}
          </p>
        )}

        <ul className="mt-4 space-y-1 flex flex-col md:flex-row gap-2 w-full justify-center text-sm text-center">
          <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
            <div className="text-7xl">💧</div>
            <div className="text-4xl my-4">
              {sensorData
                ? `${Math.round((sensorData.moisture.value / 4095) * 100)}%`
                : "N/A"}
            </div>
            <h3 className="text-2xl manrope">Moisture</h3>
          </li>

          <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
            <div className="text-7xl">🌧️</div>
            <div className="text-4xl my-4">
              {sensorData
                ? `${Math.round((sensorData.rain.value / 4095) * 100)}%`
                : "N/A"}
            </div>
            <h3 className="text-2xl manrope">Rain</h3>
          </li>

          <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
            <div className="text-7xl">♒︎</div>
            <div className="text-4xl my-4">
              {sensorData
                ? `${Math.round((sensorData.vibration.value / 4095) * 100)}%`
                : "N/A"}
            </div>
            <h3 className="text-2xl manrope">Soil Vibration</h3>
          </li>
        </ul>
      </div>
      <div className="mt-12">
        <h3 className="manrope text-2xl font-semibold">Recent Incidents</h3>
        <IncidentTable pagination={false} publicComponent />
      </div>
      {sensorData &&
        sensorData.coordinates &&
        sensorData.warningLevel.color && (
          <div className="mt-12">
            <h3 className="text-3xl manrope text-center mt-4">At risk place</h3>
            <div className="mt-2 h-[600px] w-[80%] mx-auto ">
              <MapComponent
                latitude={sensorData.coordinates.latitude}
                longitude={sensorData.coordinates.longitude}
                color={sensorData.warningLevel.color}
                title="Zone 1"
              />
            </div>
          </div>
        )}
    </Section>
  );
};

export default Content;
