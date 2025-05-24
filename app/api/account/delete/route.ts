import { NextRequest, NextResponse } from "next/server";
import UserService from "@/services/user.service";

export async function POST(req: NextRequest) {
  const userService = UserService.getInstance();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId");
    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }
    return await userService.deleteAccount(id);
  } catch (error) {
    console.error("Server error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to update profile", error: errorMessage },
      { status: 500 }
    );
  }
}
