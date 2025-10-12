"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";

interface LogsProps {
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1 solid #ccc",
    paddingBottom: 8,
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
  },
  titleSection: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  subTitle: {
    fontSize: 12,
    color: "#555",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  summaryTable: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  chartContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  chartBar: {
    height: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 3,
    marginTop: 4
  },
  logItem: {
    borderBottom: "1 solid #eee",
    paddingBottom: 4,
    marginBottom: 6,
  },
});

const getActionSummary = (logs: LogsProps[]) => {
  const summary: Record<string, number> = {};
  logs.forEach((log) => {
    summary[log.action] = (summary[log.action] || 0) + 1;
  });
  return summary;
};

const EnhancedLogsReportPDF = ({
  logs,
  period,
}: {
  logs: LogsProps[];
  period: string;
}) => {
  const summary = getActionSummary(logs);
  const total = logs.length;
  const maxCount = Math.max(...Object.values(summary), 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Landslide Monitoring System
            </Text>
            <Text style={{ fontSize: 10, color: "#555" }}>
              System Logs Summary Report
            </Text>
          </View>
          <Image
            src="/logo.png"
            style={styles.logo}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{period.toUpperCase()} LOGS SUMMARY</Text>
          <Text style={styles.subTitle}>
            Generated on {new Date().toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryTable}>
          <Text style={styles.sectionHeader}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Total Logs:</Text>
            <Text>{total}</Text>
          </View>

          {Object.entries(summary).map(([action, count], idx) => (
            <View key={idx} style={styles.summaryRow}>
              <Text>{action}</Text>
              <Text>{count}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionHeader}>Action Distribution</Text>
          {Object.entries(summary).map(([action, count], idx) => (
            <View key={idx} style={{ marginBottom: 4 }}>
              <Text>
                {action} ({count})
              </Text>
              <View
                style={[
                  styles.chartBar,
                  {
                    width: `${(count / maxCount) * 100}%`,
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View>
          <Text style={styles.sectionHeader}>Recent Logs</Text>
          {logs.length === 0 ? (
            <Text>No logs found for this period.</Text>
          ) : (
            logs.slice(0, 15).map((log, idx) => (
              <View key={idx} style={styles.logItem}>
                <Text style={{ fontWeight: "bold" }}>
                  {log.actor} — {log.action}
                </Text>
                <Text>{log.details}</Text>
                <Text style={{ color: "#555" }}>
                  {formatDateTime(log.createdAt)}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text
          style={{
            position: "absolute",
            bottom: 20,
            left: 40,
            right: 40,
            fontSize: 10,
            textAlign: "center",
            color: "#999",
          }}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

const LogsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState("daily");
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

  const filteredLogs = useMemo(() => {
    if (!logsData) return [];
    if (!searchTerm.trim()) return logsData;
    const lower = searchTerm.toLowerCase();
    return logsData.filter(
      (log) =>
        log.actor?.toLowerCase().includes(lower) ||
        log.details?.toLowerCase().includes(lower)
    );
  }, [logsData, searchTerm]);

  if (error)
    return (
      <div className="text-2xl font-semibold manrope text-red-500">
        <h3>{error.message}</h3>
      </div>
    );

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / pageSize);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const filterLogsByPeriod = (logs: LogsProps[], period: string) => {
    const now = new Date();
    const getDiff = (dateStr: string) =>
      (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    switch (period) {
      case "daily":
        return logs.filter((log) => getDiff(log.createdAt) <= 1);
      case "weekly":
        return logs.filter((log) => getDiff(log.createdAt) <= 7);
      case "monthly":
        return logs.filter((log) => getDiff(log.createdAt) <= 30);
      default:
        return logs;
    }
  };


  const handleExport = async () => {
    if (!logsData) return;
    const selectedLogs = filterLogsByPeriod(logsData, period);
    const blob = await pdf(
      <EnhancedLogsReportPDF logs={selectedLogs} period={period} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${period}-logs-summary.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex flex-wrap justify-between items-center my-4">
            <input
              type="text"
              placeholder="Search by email or details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border outline-none border-accent rounded px-3 py-2 text-sm w-72"
            />

            <div className="flex gap-2 items-center">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-accent rounded px-3 py-2 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                onClick={handleExport}
                className="bg-secondary text-white text-sm px-4 py-2 rounded hover:bg-secondary/80"
              >
                Export Summary
              </button>
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-xl mt-4">
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
                {currentLogs.map((log, index) => (
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
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

export default LogsTable;
