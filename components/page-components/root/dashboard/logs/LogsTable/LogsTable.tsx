"use client";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

interface LogsProps {
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

const LogsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: logsData,
    isFetching: isLoading,
    error,
  } = useQuery<LogsProps[] | null>({
    queryKey: ["logs"],
    queryFn: async () => UseGetResponse("/api/auth/logs"),
    staleTime: 5 * 60 * 1000,
  });

  if (error)
    return (
      <div className="text-2xl font-semibold manrope">
        <h3>{error.message}</h3>
      </div>
    );

  const totalLogs = logsData?.length || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const currentLogs = logsData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  return (
    <>
      {isLoading ? (
        <GlobalSpinningLoader variant="big" />
      ) : (
        <>
          <div className="relative overflow-x-auto mt-12 rounded-xl">
            <table className="w-full text-sm text-left rtl:text-right text-gray-700 table-auto">
              <thead className="text-xs text-white uppercase bg-secondary border border-gray-500">
                <tr>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs?.map((log, index) => (
                  <tr key={index} className="border bg-gray-50 border-gray-300">
                    <th className="px-6 py-4 font-medium text-black whitespace-nowrap">
                      {log.actor}
                    </th>
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4">{log.details}</td>
                    <td className="px-6 py-4">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
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

      {!isLoading && logsData?.length === 0 && (
        <div className="mt-6 text-center">
          <h3 className="text-2xl manrope font-semibold">
            No logs have been found.
          </h3>
        </div>
      )}
    </>
  );
};

export default LogsTable;
