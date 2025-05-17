"use client";
import React, { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { evaluateLandslideRisk } from "@/utils/monitoring/riskEvaluator";
import {
  BreakPointHooks,
  breakpointsTailwind,
} from "@react-hooks-library/core";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";

const sensorHistory = [
  {
    time: "10:00",
    vibration: 0.8,
    soilMoisture: 70,
    temperature: 65,
    humidity: 78,
  },
  {
    time: "10:30",
    vibration: 1.1,
    soilMoisture: 75,
    temperature: 65,
    humidity: 78,
  },
  {
    time: "11:00",
    vibration: 1.8,
    soilMoisture: 85,
    temperature: 65,
    humidity: 78,
  },
];

const Content = () => {
  const [sensorData, setSensorData] = useState<{
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
    tilt: {
      value: number;
      timestamp: string;
    };
    warningLevel: string;
  } | null>(null);
  useEffect(() => {
    const dataRef = ref(database, "sensors/");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setSensorData(data);
    });

    return () => unsubscribe();
  }, []);
  const { useGreater, useBetween, useSmaller } =
    BreakPointHooks(breakpointsTailwind);
  const greater = useGreater("md");
  const between = useBetween("md", "lg");
  const smaller = useSmaller("2xl");
  const chartWidth = (() => {
    if (greater) return 550;
    if (between) return 400;
    if (smaller) return 300;
    return 230;
  })();
  const riskLevel = evaluateLandslideRisk(sensorData);
  const riskColor = {
    High: "bg-red-500",
    Medium: "bg-yellow-400",
    Low: "bg-blue-400",
    Good: "bg-green-500",
  };
  return (
    <section className="container mx-auto p-4">
      <div className="flex items-center gap-4 w-full justify-between">
        <h2 className="text-4xl manrope font-semibold">Dashboard</h2>
        <div
          className={`text-white text-xs px-4 py-2 rounded shadow ${riskColor[riskLevel]}`}
        >
          Landslide Risk Level: <strong>{riskLevel}</strong>
        </div>
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
          <li className="px-4 py-1 rounded bg-secondary text-white">
            ⛰️ Tilt: {sensorData?.tilt.value ?? "N/A"}
          </li>
        </ul>
      </div>
      <div className="mt-4 space-y-6 p-4 border border-black/20 rounded">
        <h3 className="font-semibold text-4xl mb-2 text-center">History</h3>
        <div className="flex items-center justify-center">
          <div className="grid xl:grid-cols-2 gap-4">
            <LineChart
              width={chartWidth}
              height={250}
              data={sensorHistory}
              className="border border-black/20 w-full p-2 rounded"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="soilMoisture"
                stroke="#8884d8"
                name="Soil Moisture"
              />
            </LineChart>
            <LineChart
              width={chartWidth}
              height={250}
              data={sensorHistory}
              className="border border-black/20 w-full p-2 rounded"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="vibration"
                stroke="#8884d8"
                name="Vibration"
              />
            </LineChart>
            <LineChart
              width={chartWidth}
              height={250}
              data={sensorHistory}
              className="border border-black/20 w-full p-2 rounded"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#8884d8"
                name="Humidity"
              />
            </LineChart>
            <LineChart
              width={chartWidth}
              height={250}
              data={sensorHistory}
              className="border border-black/20 w-full p-2 rounded"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#8884d8"
                name="Temperature"
              />
            </LineChart>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Content;
