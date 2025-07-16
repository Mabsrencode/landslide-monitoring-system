"use client";
import SpinnerLoader from "@/components/reusable/SpinnerLoader/SpinnerLoader";
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
    isFetching: isLoading,
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
  if (error)
    return (
      <div className="text-2xl font-semibold manrope">
        <h3>{error.message}</h3>
      </div>
    );
  return (
    <>
      {isLoading ? (
        <div className="w-full h-full">
          <SpinnerLoader variant="big" />
        </div>
      ) : (
        <div className="relative overflow-x-auto mt-12 rounded-xl">
          <table className="w-full text-sm text-left rtl:text-right text-gray-700 table-auto">
            <thead className="text-xs text-white uppercase bg-secondary border border-gray-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Actor
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
                <th scope="col" className="px-6 py-3">
                  Details
                </th>
                <th scope="col" className="px-6 py-3">
                  Created AT
                </th>
              </tr>
            </thead>
            <tbody>
              {logsData &&
                logsData.length > 0 &&
                logsData.map((e, index) => (
                  <tr
                    key={index}
                    className="border bg-gray-200 border-gray-300"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-black whitespace-nowrap"
                    >
                      {e.actor}
                    </th>
                    <td className="px-6 py-4"> {e.action}</td>
                    <td className="px-6 py-4"> {e.details}</td>
                    <td className="px-6 py-4">
                      {" "}
                      {formatDateTime(e.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

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
