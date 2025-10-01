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
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error) },
      { status: 500 }
    );
  }
}
