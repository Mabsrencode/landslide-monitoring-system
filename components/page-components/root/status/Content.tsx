"use client";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import Section from "@/components/reusable/Section/Section";
import { database } from "@/lib/firebase/firebase-client";
import { onValue, ref } from "firebase/database";
import MapComponent from "@/components/reusable/Map";
import React, { useEffect, useState } from "react";
import IncidentTable from "../dashboard/incidents/IncidentTable/IncidentTable";
import { useQuery } from "@tanstack/react-query";

const Content = () => {
  const [sensorData, setSensorData] = useState<RealtimeSensorData>(null);
  const { data: sensorName } = useQuery<{ name: string }>({
    queryKey: ["sensor-name"],
    queryFn: async () => {
      const response = await fetch("/api/monitor/get-sensor-name");
      const data = await response.json();
      return data;
    },
  });
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

  let statusColor: string;
  switch (sensorData?.warningLevel.color) {
    case "RED":
      statusColor = "bg-red-500";
      break;
    case "ORANGE":
      statusColor = "bg-orange-500";
      break;
    case "YELLOW":
      statusColor = "bg-yellow-300";
      break;
    case "GREEN":
      statusColor = "bg-green-400";
      break;
    default:
      statusColor = "bg-green-500";
  }

  return (
    <Section>
      <BackRoute />
      <div
        className={`text-white text-2xl text-center px-4 py-2 rounded shadow ${statusColor}`}
      >
        Landslide Risk Level:{" "}
        <strong>{sensorData?.warningLevel.message}</strong>
      </div>

      <div className="p-4 border border-black/20 rounded mt-6">
        <h3 className="font-semibold text-2xl manrope text-center">
          Current Readings
        </h3>

        {latestTimestamp && (
          <p className="text-center text-gray-400 text-sm mt-2">
            Last updated: {latestTimestamp}
          </p>
        )}

        <ul className="mt-4 space-y-1 flex items-center flex-col md:flex-row gap-2 w-full justify-center text-sm text-center">
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
        <h3 className="manrope text-2xl font-semibold">Recent Alerts</h3>
        <IncidentTable pagination={false} publicComponent />
      </div>
      <div>
        {sensorData &&
          sensorData.coordinates &&
          sensorData.warningLevel.color &&
          sensorName && (
            <div className="mt-12">
              <h3 className="text-3xl manrope text-center mt-4">
                At risk place
              </h3>
              <div className="mt-2 h-[300px] lg:h-[600px] lg:w-[80%] mx-auto ">
                <MapComponent
                  latitude={sensorData.coordinates.latitude}
                  longitude={sensorData.coordinates.longitude}
                  color={sensorData.warningLevel.color}
                  title={sensorName.name}
                />
              </div>
            </div>
          )}
      </div>
    </Section>
  );
};

export default Content;
