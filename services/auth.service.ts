import { auth, db, doc, setDoc } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { NextResponse } from "next/server";

class AuthService {
  private static instance: AuthService;
  public static getInstance = () => {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  };
  public register = async (
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    contactNumber: string
  ) => {
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
  };
  public login = async (email: string, password: string) => {
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
  };
}

export default AuthService;
