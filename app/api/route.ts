import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return NextResponse.json({ valid: true, uid: decodedToken.uid });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "Verifying failed", valid: false },
      { status: 401 }
    );
  }
}
