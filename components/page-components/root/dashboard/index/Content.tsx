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

const sensorHistory = [
  { time: "10:00", vibration: 0.8, soilMoisture: 70 },
  { time: "10:30", vibration: 1.1, soilMoisture: 75 },
  { time: "11:00", vibration: 1.8, soilMoisture: 85 },
];
const dummySensorData = {
  vibration: 1.8,
  humidity: 92,
  soilMoisture: 85,
  temperature: 24,
};

const Content = () => {
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
      <div className="mt-4 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-black/20 rounded">
            <h3 className="font-semibold text-lg mb-2">
              Soil & Vibration History
            </h3>
            <LineChart width={400} height={250} data={sensorHistory}>
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
              <Line
                type="monotone"
                dataKey="vibration"
                stroke="#82ca9d"
                name="Vibration"
              />
            </LineChart>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Content;
