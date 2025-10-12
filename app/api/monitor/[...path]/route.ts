import { NextResponse } from "next/server";
import MonitorService from "@/services/monitor.service";

const monitorService = MonitorService.getInstance();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (path.includes("incidents")) {
      const response = await monitorService.getIncidents();
      return response;
    }
    if (path.includes("sensor-history")) {
      const response = await monitorService.getSensorHistory();
      return response;
    }
    if (path.includes("get-sensor-name")) {
      return await monitorService.getSensorName();
    }
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    if (path.includes("update-sensor-name")) {
      const { name } = await request.json();
      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { message: "Name is required and must be a string" },
          { status: 400 }
        );
      }

      const response = await monitorService.updateSensorName(name);
      return response;
    }

    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
