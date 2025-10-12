"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UseGetResponse } from "@/hooks/useGetResponse";
import { formatDateTime } from "@/utils/formatDateTime";
import GlobalSpinningLoader from "@/components/reusable/SpinnerLoader/GlobalSpinningLoader";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface SensorValue {
  value: number;
}

interface WarningLevel {
  color: string;
  message: string;
}

export interface RealtimeSensorData {
  moisture: SensorValue;
  rain: SensorValue;
  vibration: SensorValue;
  warningLevel: WarningLevel;
  createdAt: string;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 18, textAlign: "center", marginBottom: 20 },
  section: { marginBottom: 10 },
  tableHeader: { flexDirection: "row", borderBottom: 1, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottom: 0.5 },
  cell: { flex: 1, padding: 4 },
  bold: { fontWeight: "bold" },
  summary: { marginTop: 15, fontSize: 12 },
});

const filterLogsByRange = (logs: RealtimeSensorData[], range: string) => {
  const now = new Date();

  return logs.filter((log) => {
    const logDate = new Date(log.createdAt);

    if (range === "today") {
      return (
        logDate.getFullYear() === now.getFullYear() &&
        logDate.getMonth() === now.getMonth() &&
        logDate.getDate() === now.getDate()
      );
    }

    const diffDays =
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);

    if (range === "weekly") return diffDays <= 7;
    if (range === "monthly") return diffDays <= 30;
    return true;
  });
};

type NumericField = "moisture" | "rain" | "vibration";

const SensorReportPDF = ({
  logs,
  range,
}: {
  logs: RealtimeSensorData[];
  range: string;
}) => {
  const avg = (field: NumericField) => {
    const values = logs
      .map((l) => l[field].value)
      .filter((v): v is number => typeof v === "number");

    return values.length
      ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
      : "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Landslide Monitoring System — Sensor Report ({range.toUpperCase()})
        </Text>

        <View style={styles.section}>
          <Text>Generated on: {new Date().toLocaleString()}</Text>
          <Text>Total Logs: {logs.length}</Text>
        </View>

        <View style={styles.summary}>
          <Text>📊 Summary:</Text>
          <Text>• Avg Moisture: {avg("moisture")}</Text>
          <Text>• Avg Rain: {avg("rain")}</Text>
          <Text>• Avg Vibration: {avg("vibration")}</Text>
        </View>

        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.bold]}>Moisture</Text>
            <Text style={[styles.cell, styles.bold]}>Rain</Text>
            <Text style={[styles.cell, styles.bold]}>Vibration</Text>
            <Text style={[styles.cell, styles.bold]}>Level</Text>
            <Text style={[styles.cell, styles.bold]}>Message</Text>
            <Text style={[styles.cell, styles.bold]}>Created At</Text>
          </View>

          {logs.map((log, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.cell}>{log.moisture.value}</Text>
              <Text style={styles.cell}>{log.rain.value}</Text>
              <Text style={styles.cell}>{log.vibration.value}</Text>
              <Text style={styles.cell}>{log.warningLevel.color}</Text>
              <Text style={styles.cell}>{log.warningLevel.message}</Text>
              <Text style={styles.cell}>{formatDateTime(log.createdAt)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// ✅ Main Table Component
const SensorLogsTable = () => {
  const [reportRange, setReportRange] = useState<
    "today" | "weekly" | "monthly"
  >("today");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: sensorHistoryLogs,
    isPending: isLoadingSensorHistoryLogs,
    error: errorSensorHistoryLogs,
  } = useQuery<RealtimeSensorData[] | null>({
    queryKey: ["sensor-history"],
    queryFn: async () => UseGetResponse("/api/monitor/sensor-history"),
  });

  const filteredLogs = useMemo(() => {
    if (!sensorHistoryLogs) return [];
    return filterLogsByRange(sensorHistoryLogs, reportRange);
  }, [sensorHistoryLogs, reportRange]);

  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const currentLogs = filteredLogs.slice(
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

  if (errorSensorHistoryLogs)
    return (
      <div className="text-center text-red-500 font-semibold mt-6">
        {errorSensorHistoryLogs.message}
      </div>
    );

  return (
    <>
      {isLoadingSensorHistoryLogs ? (
        <GlobalSpinningLoader variant="big" />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Sensor Logs Report
            </h2>

            <div className="flex gap-2 items-center">
              <select
                value={reportRange}
                onChange={(e) => {
                  setReportRange(
                    e.target.value as "today" | "weekly" | "monthly"
                  );
                  setCurrentPage(1);
                }}
                className="border border-accent rounded px-2 py-1 text-sm"
              >
                <option value="today">Today</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              <PDFDownloadLink
                document={
                  <SensorReportPDF logs={filteredLogs} range={reportRange} />
                }
                fileName={`sensor-report-${reportRange}.pdf`}
                className={`px-4 py-2 rounded text-sm transition ${
                  filteredLogs.length > 0
                    ? "bg-secondary text-white hover:bg-secondary/80"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {({ loading }) =>
                  loading
                    ? "Generating PDF..."
                    : filteredLogs.length > 0
                    ? "Export PDF"
                    : "No Data"
                }
              </PDFDownloadLink>
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-xl">
            <table className="w-full text-sm text-left text-gray-700 table-auto">
              <thead className="text-xs text-white uppercase bg-secondary border border-gray-500">
                <tr>
                  <th className="px-6 py-3">Moisture</th>
                  <th className="px-6 py-3">Rain</th>
                  <th className="px-6 py-3">Vibration</th>
                  <th className="px-6 py-3">Warning Level</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs && currentLogs.length > 0 ? (
                  currentLogs.map((sensor, index) => (
                    <tr
                      key={index}
                      className="border bg-gray-50 border-gray-300"
                    >
                      <td className="px-6 py-4 font-medium text-black whitespace-nowrap">
                        {sensor.moisture.value ?? "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {sensor.rain.value ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {sensor.vibration.value ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`px-2 py-1 rounded text-white bg-${sensor.warningLevel.color}-500`}
                        >
                          {sensor.warningLevel.color}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {sensor.warningLevel.message}
                      </td>
                      <td className="px-6 py-4">
                        {formatDateTime(sensor.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 text-sm"
                    >
                      No sensor logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
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
                    className={`px-3 py-1 rounded text-sm ${
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
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50 text-sm"
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
    </>
  );
};

export default SensorLogsTable;
