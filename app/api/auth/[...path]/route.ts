import { NextResponse } from "next/server";
import AuthService from "@/services/auth.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const authService = AuthService.getInstance();
  try {
    const { path } = await params;
    if (path.includes("register")) {
      const { email, password, username, firstName, lastName, contactNumber } =
        await request.json();
      return await authService.register(
        email,
        password,
        username,
        firstName,
        lastName,
        contactNumber
      );
    }
    if (path.includes("login")) {
      const { email, password } = await request.json();
      return await authService.login(email, password);
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
