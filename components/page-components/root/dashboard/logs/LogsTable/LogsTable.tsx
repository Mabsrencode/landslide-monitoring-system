"use client";
import { formatDateTime } from "@/utils/formatDateTime";
import { useQuery } from "@tanstack/react-query";
import React from "react";
interface LogsProps {
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}
const LogsTable = () => {
  const {
    data: logsData,
    isPending: isLoading,
    error,
  } = useQuery<LogsProps[] | null>({
    queryKey: ["logs"],
    queryFn: async () => {
      const response = await fetch("/api/auth/logs");
      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
  if (isLoading)
    return (
      <div className="grid gap-2 mt-12">
        {Array.from({ length: 8 }).map((_, e) => (
          <div key={e} className="grid grid-cols-4 gap-2">
            <div className="h-[10px] w-[80%] bg-gray-400 rounded-full animate-pulse"></div>
            <div className="h-[10px] w-[20%] bg-gray-400 rounded-full animate-pulse"></div>
            <div className="h-[10px] w-[80%] bg-gray-400 rounded-full animate-pulse"></div>
            <div className="h-[10px] w-[100%] bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  if (error)
    return (
      <div className="text-2xl font-semibold manrope">
        <h3>{error.message}</h3>
      </div>
    );
  return (
    <>
      <table className="table-auto w-full mt-12">
        <thead>
          <tr>
            <th className="border border-black/20 p-2">Actor</th>
            <th className="border border-black/20 p-2">Action</th>
            <th className="border border-black/20 p-2">Details</th>
            <th className="border border-black/20 p-2">Created at</th>
          </tr>
        </thead>
        <tbody>
          {logsData &&
            logsData.length > 0 &&
            logsData.map((e, index) => (
              <tr key={index}>
                <td className="border border-black/20 p-2 text-sm">
                  {e.actor}
                </td>
                <td className="border border-black/20 p-2 text-sm">
                  {e.action}
                </td>
                <td className="border border-black/20 p-2 text-sm">
                  {e.details}
                </td>
                <td className="border border-black/20 p-2 text-sm">
                  {formatDateTime(e.createdAt)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {logsData && logsData.length === 0 && (
        <div className="mt-6 text-center">
          <h3 className="text-2xl manrope font-semibold">
            No logs has been found.
          </h3>
        </div>
      )}
    </>
  );
};

export default LogsTable;
