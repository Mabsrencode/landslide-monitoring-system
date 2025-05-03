import { NextRequest, NextResponse } from "next/server";
import UserService from "@/services/user.service";

export async function POST(req: NextRequest) {
  const userService = UserService.getInstance();
  try {
    const body = await req.json();
    return await userService.updateProfile(body.uid, body);
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
