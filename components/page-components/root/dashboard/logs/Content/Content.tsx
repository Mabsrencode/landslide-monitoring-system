"use client";
import React, { useState } from "react";
import UserLogsTable from "../UserLogsTable/UserLogsTable";
import SensorLogsTable from "../SensorLogsTable/SensorLogsTable";
import Section from "@/components/reusable/Section/Section";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";

const Content = () => {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <Section>
      <BackRoute />
      <h2 className="text-4xl manrope font-semibold mb-6">Logs</h2>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("user")}
          className={`pb-2 font-medium text-lg ${
            activeTab === "user"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          User Logs
        </button>
        <button
          onClick={() => setActiveTab("sensor")}
          className={`pb-2 font-medium text-lg ${
            activeTab === "sensor"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Sensor Logs
        </button>
      </div>
      {activeTab === "user" ? <UserLogsTable /> : <SensorLogsTable />}
    </Section>
  );
};

export default Content;
