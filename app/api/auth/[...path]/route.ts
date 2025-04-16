import { auth } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { NextResponse } from "next/server";
import { db, doc, setDoc } from "@/lib/firebase/config";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (path.includes("register")) {
      const { email, password, username, firstName, lastName, contactNumber } =
        await request.json();
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email,
          username,
          firstName,
          lastName,
          contactNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        const token = await user.getIdToken();

        const response = NextResponse.json(
          {
            message: "User created successfully",
            user: { uid: user.uid, email },
          },
          { status: 200 }
        );

        response.cookies.set("bantay-access-tk", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60,
          path: "/",
        });

        return response;
      } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
          { message: (error as Error).message || "Registration failed" },
          { status: 400 }
        );
      }
    }
    if (path.includes("login")) {
      const { email, password } = await request.json();
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const token = await user.getIdToken();
        const response = NextResponse.json(
          {
            message: "Login successful",
            user: { uid: user.uid, email: user.email },
          },
          { status: 200 }
        );
        response.cookies.set("bantay-access-tk", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60,
          path: "/",
        });
        return response;
      } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
          { message: (error as Error).message || "Login failed" },
          { status: 400 }
        );
      }
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
