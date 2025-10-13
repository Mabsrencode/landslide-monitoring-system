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

const Content = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [sensorData, setSensorData] = useState<RealtimeSensorData>(null);
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
  const { data: incidentData, isPending: isLoadingIncidentData } = useQuery<
    LogsProps[] | null
  >({
    queryKey: ["incidents"],
    queryFn: async () => UseGetResponse("/api/monitor/incidents"),
    staleTime: 5 * 60 * 1000,
    enabled: !!isAdmin,
  });
  const { data: noOfUsers, isFetching: isLoadingNoOfUser } =
    useQuery<UserListResponse>({
      queryKey: ["users"],
      queryFn: async () => UseGetResponse("/api/account/all-users"),
      staleTime: 5 * 60 * 1000,
      enabled: !!isAdmin,
    });

  const { data: sensorHistoryData } = useQuery<SensorHistoryItem[]>({
    queryKey: ["sensor-history"],
    queryFn: async () => UseGetResponse("/api/monitor/sensor-history"),
    staleTime: 5 * 60 * 1000,
  });

  const chartData: ChartDataPoint[] =
    sensorHistoryData?.map((item) => ({
      time: new Date(item.createdAt).toLocaleTimeString(),
      moisture: item.moisture.value,
      rain: item.rain.value,
      vibration: item.vibration.value,
    })) || [];

  const numberOfVerifiedResidents =
    usersData &&
    usersData.data &&
    usersData.data.filter((e) => e.status === "active");
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
  if (!user) return <MainLoader />;
  return (
    <Section>
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex flex-col justify-between w-full lg:flex-row items-center">
          <h2 className="text-4xl manrope font-semibold">Dashboard</h2>
          <div
            className={`text-white text-xs px-4 py-2 rounded shadow ${statusColor}`}
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
                  <div className="w-[50px] h-[50px] border-3 mx-auto border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                ) : (
                  <div className="text-4xl my-4">
                    {numberOfVerifiedResidents?.length}
                  </div>
                )}
                <h3 className="text-2xl manrope">Verified Residents</h3>
              </div>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] min-h-fit flex items-center justify-center">
              <div>
                {isLoadingIncidentData ? (
                  <div className="w-[50px] h-[50px] border-3 mx-auto border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                ) : (
                  <div className="text-4xl my-4">{incidentData?.length}</div>
                )}
                <h3 className="text-2xl manrope">Alerts</h3>
              </div>
            </li>
            <li className="p-4 rounded bg-secondary text-white w-[300px] min-h-fit flex items-center justify-center">
              <div>
                {isLoadingNoOfUser ? (
                  <div className="w-[50px] h-[50px] border-3 mx-auto border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                ) : (
                  <div className="text-4xl my-4">{noOfUsers?.data?.length}</div>
                )}
                <h3 className="text-2xl manrope">No of Users</h3>
              </div>
            </li>
          </ul>
        </div>
      )}
      {!isAdmin && (
        <div className="p-4 border border-black/20 rounded mt-6">
          <h3 className="font-semibold text-2xl manrope text-center capitalize">
            current readings
          </h3>
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
      )}

      {isAdmin && (
        <div className="mt-4 space-y-6 p-4 border border-black/20 rounded">
          <h3 className="font-semibold text-4xl mb-2 text-center capitalize">
            Current readings
          </h3>
          <div className="flex items-center justify-center">
            <div className="grid xl:grid-cols-2 gap-4">
              <LineChart
                width={chartWidth}
                height={250}
                data={chartData}
                className="border border-black/20 w-full p-2 rounded"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="moisture"
                  stroke="#8884d8"
                  name="Soil Moisture"
                />
              </LineChart>
              <LineChart
                width={chartWidth}
                height={250}
                data={chartData}
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
                  stroke="#82ca9d"
                  name="Vibration"
                />
              </LineChart>
              <LineChart
                width={chartWidth}
                height={250}
                data={chartData}
                className="border border-black/20 w-full p-2 rounded"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rain"
                  stroke="#ff7300"
                  name="Rain"
                />
              </LineChart>
            </div>
          </div>
        </div>
      )}
      {!isAdmin && (
        <div className="mt-12">
          <h3 className="manrope text-2xl font-semibold">Recent Alerts</h3>
          <IncidentTable pagination={false} />
        </div>
      )}
    </Section>
  );
};

export default Content;
