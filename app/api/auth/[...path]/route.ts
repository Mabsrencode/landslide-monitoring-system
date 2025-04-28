import { NextResponse } from "next/server";
import AuthService from "@/services/auth.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const authService = AuthService.getInstance();
  try {
    const { path } = await params;
    if (path.includes("send-otp")) {
      const { phoneNumber, recaptchaToken } = await request.json();
      return await authService.sendOtp(phoneNumber, recaptchaToken);
    }
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
    if (path.includes("verify-email")) {
      const { oobCode } = await request.json();
      return authService.verifyEmail(oobCode);
    }
    if (path.includes("resend-verification-email")) {
      const { email, password } = await request.json();
      return await authService.resendVerification(email, password);
    }
    if (path.includes("forgot-password")) {
      const { email } = await request.json();
      return await authService.sendPasswordResetEmail(email);
    }
    if (path.includes("reset-password")) {
      const { oobCode, newPassword } = await request.json();
      return await authService.confirmPasswordReset(oobCode, newPassword);
    }
    if (path.includes("logout")) {
      return await authService.logout();
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
