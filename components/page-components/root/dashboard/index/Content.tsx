"use client";
import React from "react";

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
const dummySensorData = {
  vibration: 1.8,
  humidity: 92,
  soilMoisture: 85,
  temperature: 24,
};

const Content = () => {
  const { useGreater, useBetween, useSmaller } =
    BreakPointHooks(breakpointsTailwind);
  const greater = useGreater("md");
  const between = useBetween("md", "lg");
  const smaller = useSmaller("2xl");
  const chartWidth = (() => {
    if (greater) return 700;
    if (between) return 500;
    if (smaller) return 400;
    return 230;
  })();
  const riskLevel = evaluateLandslideRisk(dummySensorData);
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
            🌡️ Temperature: {dummySensorData.temperature} °C
          </li>
          <li className="px-4 py-1 rounded bg-secondary text-white">
            💧 Humidity: {dummySensorData.humidity} %
          </li>
          <li className="px-4 py-1 rounded bg-secondary text-white">
            🌱 Soil Moisture: {dummySensorData.soilMoisture} %
          </li>
          <li className="px-4 py-1 rounded bg-secondary text-white">
            ♒︎ Vibration: {dummySensorData.vibration} g
          </li>
        </ul>
      </div>
      <div className="mt-4 space-y-6 p-4 border border-black/20 rounded">
        <h3 className="font-semibold text-lg mb-2">History</h3>
        <div className="grid md:grid-cols-2 w-full gap-4">
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
    </section>
  );
};

export default Content;
