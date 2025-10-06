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

import {
  BreakPointHooks,
  breakpointsTailwind,
} from "@react-hooks-library/core";
import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase/firebase-client";
import Section from "@/components/reusable/Section/Section";
import { useAuthStore } from "@/stores/authStore";
import IncidentTable from "../incidents/IncidentTable/IncidentTable";
import { useQuery } from "@tanstack/react-query";
import { UseGetResponse } from "@/hooks/useGetResponse";
import MainLoader from "@/components/reusable/MainLoader/MainLoader";
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
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
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

  const { data: usersData, isPending: isLoadingUsersData } =
    useQuery<UserListResponse>({
      queryKey: ["users"],
      queryFn: async () => UseGetResponse("/api/account/all-users"),
      staleTime: 5 * 60 * 1000,
      enabled: !!isAdmin,
    });

  const numberOfVerifiedResidents =
    usersData &&
    usersData.data &&
    usersData.data.filter((e) => e.status === "active");
  if (!user) return <MainLoader />;
  return (
    <Section>
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex flex-col justify-between w-full lg:flex-row items-center">
          <h2 className="text-4xl manrope font-semibold">Dashboard</h2>
          <div
            className={`text-white text-xs px-4 py-2 rounded shadow bg-${sensorData?.warningLevel.color.toLowerCase()}-500`}
          >
            Landslide Risk Level:{" "}
            <strong>{sensorData?.warningLevel.message}</strong>
          </div>
        </div>
      </div>
      {isAdmin && (
        <div className="p-4 border border-black/20 rounded mt-6">
          <ul className="mt-4 space-y-1 flex flex-col md:flex-row gap-2 w-full justify-center text-sm text-center">
            <li className="p-4 rounded bg-secondary text-white w-[300px] min-h-fit flex items-center justify-center">
              <div>
                {isLoadingUsersData ? (
                  <div className="w-[50px] h-[50px] border-3 mx-auto border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="text-4xl my-4">
                    {numberOfVerifiedResidents?.length}
                  </div>
                )}
                <h3 className="text-2xl manrope">Residents</h3>
              </div>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
              <div className="text-7xl">🌧️</div>
              <div className="text-4xl my-4">
                {sensorData?.rain.value ?? "N/A"}
              </div>
              <h3 className="text-2xl manrope">Rain</h3>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
              <div className="text-7xl">♒︎</div>
              <div className="text-4xl my-4">
                {sensorData?.vibration.value ?? "N/A"}
              </div>
              <h3 className="text-2xl manrope">Soil Vibration</h3>
            </li>
          </ul>
        </div>
      )}
      {!isAdmin && (
        <div className="p-4 border border-black/20 rounded mt-6">
          <h3 className="font-semibold text-2xl manrope text-center">
            Current Sensor Data
          </h3>
          <ul className="mt-4 space-y-1 flex flex-col md:flex-row gap-2 w-full justify-center text-sm text-center">
            <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
              <div className="text-7xl">💧</div>
              <div className="text-4xl my-4">
                {sensorData?.moisture.value ?? "N/A"}
              </div>
              <h3 className="text-2xl manrope">Moisture</h3>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
              <div className="text-7xl">🌧️</div>
              <div className="text-4xl my-4">
                {sensorData?.rain.value ?? "N/A"}
              </div>
              <h3 className="text-2xl manrope">Rain</h3>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] h-full">
              <div className="text-7xl">♒︎</div>
              <div className="text-4xl my-4">
                {sensorData?.vibration.value ?? "N/A"}
              </div>
              <h3 className="text-2xl manrope">Soil Vibration</h3>
            </li>
          </ul>
        </div>
      )}
      {isAdmin && (
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
            </div>
          </div>
        </div>
      )}
      {!isAdmin && (
        <div className="mt-12">
          <h3 className="manrope text-2xl font-semibold">Recent Incidents</h3>
          <IncidentTable pagination={false} />
        </div>
      )}
    </Section>
  );
};

export default Content;
