"use client";
import React, { useState, useMemo } from "react";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

const IncidentTable = ({
  pagination,
  publicComponent,
}: {
  pagination: boolean;
  publicComponent?: boolean;
}) => {
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 10;

  const {
    data: logsData,
    isFetching: isLoading,
    error,
  } = useQuery<LogsProps[] | null>({
    queryKey: ["incidents"],
    queryFn: async () => UseGetResponse("/api/monitor/incidents"),
    staleTime: 5 * 60 * 1000,
  });

  const filteredLogs = useMemo(() => {
    if (!logsData) return [];

    let logs = [...logsData];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.message.toLowerCase().includes(lower) ||
          log.type.toLowerCase().includes(lower)
      );
    }

    return logs;
  }, [logsData, searchTerm]);

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const visibleLogs =
    user?.role === "user" || publicComponent
      ? filteredLogs.slice(0, 3)
      : filteredLogs.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        );
  if (error)
    return (
      <div className="text-2xl font-semibold manrope text-red-500">
        <h3>{error.message}</h3>
      </div>
    );

  return (
    <>
      {isLoading ? (
        <GlobalSpinningLoader variant="big" />
      ) : (
        <>
          {user && user.role === "admin" && (
            <div className="flex flex-wrap items-center justify-end gap-4">
              <input
                type="text"
                placeholder="Search by message..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="outline-none border-accent border rounded px-3 py-2 w-72 text-sm"
              />
            </div>
          )}

          <div className="relative overflow-x-auto rounded-xl mt-8">
            <table className="w-full text-sm text-left text-gray-700 table-auto">
              <thead className="text-xs text-white uppercase bg-secondary border border-gray-500">
                <tr>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((log, index) => (
                  <tr key={index} className="border bg-gray-50 border-gray-300">
                    <td className="px-6 py-4 font-medium text-black whitespace-nowrap">
                      <span
                        className={`py-1 px-3 rounded-full bg-${log.level.toLowerCase()}-500 text-white`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">{log.message}</td>
                    <td className="px-6 py-4">{log.type}</td>
                    <td className="px-6 py-4">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer text-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {generatePageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="px-3 py-1 text-gray-500 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`px-3 py-1 rounded cursor-pointer text-sm ${
                      currentPage === page
                        ? "bg-secondary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 cursor-pointer text-sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && filteredLogs.length === 0 && (
        <div className="mt-6 text-center">
          <h3 className="text-2xl manrope font-semibold text-gray-500">
            No logs found.
          </h3>
        </div>
      )}
    </>
  );
};

export default IncidentTable;
