"use client";
import Section from "@/components/reusable/Section/Section";
import React, { useEffect, useState } from "react";
import { database } from "@/lib/firebase/firebase-client";
import { onValue, ref } from "firebase/database";
import MapComponent from "@/components/reusable/Map";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Content = () => {
  const { user } = useAuthStore();
  const [sensorData, setSensorData] = useState<RealtimeSensorData>(null);
  const queryClient = useQueryClient();

  const updateSensorNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const response = await fetch("/api/monitor/update-sensor-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sensor name");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensor-name"] });
      toast.success(`Successfully saving sensor name.`);
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

  const { data: sensorName } = useQuery<{ name: string }>({
    queryKey: ["sensor-name"],
    queryFn: async () => {
      const response = await fetch("/api/monitor/get-sensor-name");
      const data = await response.json();
      return data;
    },
  });

  const handleTitleChange = (newTitle: string) => {
    updateSensorNameMutation.mutate(newTitle);
  };

  return (
    <Section>
      <h3 className="text-3xl manrope text-center mt-4">
        {user && user.role === "admin" ? "Device Locations" : "At risk place"}
      </h3>
      {sensorData && sensorData.coordinates && sensorName && (
        <div className="mt-2 h-[600px] w-[80%] mx-auto ">
          <MapComponent
            latitude={sensorData.coordinates.latitude}
            longitude={sensorData.coordinates.longitude}
            color={sensorData.warningLevel.color}
            title={sensorName.name}
            onTitleChange={handleTitleChange}
          />
        </div>
      )}
      {updateSensorNameMutation.isPending && (
        <div className="text-center mt-2 text-blue-500">
          Updating sensor name...
        </div>
      )}
      {updateSensorNameMutation.isError && (
        <div className="text-center mt-2 text-red-500">
          Error updating sensor name
        </div>
      )}
    </Section>
  );
};

export default Content;
