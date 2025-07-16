import { NextResponse } from "next/server";
import UserService from "@/services/user.service";
const userService = UserService.getInstance();
export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const { searchParams } = new URL(request.url);
    if (path.includes("delete")) {
      const id = searchParams.get("userId");
      if (!id) {
        return NextResponse.json(
          { message: "User ID is required" },
          { status: 400 }
        );
      }
      return await userService.deleteAccount(id);
    }
    if (path.includes("update")) {
      const body = await request.json();
      return await userService.updateProfile(body.uid, body);
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (path.includes("all-users")) {
      return userService.listAllUsers();
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
