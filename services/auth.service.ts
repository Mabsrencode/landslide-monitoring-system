import { adminAuth } from "@/lib/firebase/admin";
import { auth, db, doc, setDoc } from "@/lib/firebase/config";
import {
  applyActionCode,
  checkActionCode,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
      if (
        !email ||
        !password ||
        !username ||
        !firstName ||
        !lastName ||
        !contactNumber
      ) {
        return NextResponse.json(
          { message: "All fields are required" },
          { status: 400 }
        );
      }
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
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
        emailVerified: false,
        status: "pending_verification",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);
      return NextResponse.json(
        {
          message: "Verification email sent. Please check your inbox.",
          requiresVerification: true,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      let statusCode = 400;

      if ((error as { code: string }).code === "auth/email-already-in-use") {
        errorMessage = "Email already in use";
      } else if ((error as { code: string }).code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if ((error as { code: string }).code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (
        (error as { code: string }).code === "auth/too-many-requests"
      ) {
        errorMessage = "Too many request, Please try again later.";
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: statusCode }
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

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        return NextResponse.json(
          {
            message:
              "Email not verified. A new verification link has been sent.",
            requiresVerification: true,
          },
          { status: 401 }
        );
      }

      const token = await user.getIdToken();
      const response = NextResponse.json(
        { message: "Login successful" },
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
      let errorMessage = "Registration failed";
      let statusCode = 400;

      if ((error as { code: string }).code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if ((error as { code: string }).code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (
        (error as { code: string }).code === "auth/too-many-requests"
      ) {
        errorMessage = "Too many request, Please try again later.";
      } else if (
        (error as { code: string }).code === "auth/invalid-credential"
      ) {
        errorMessage = "Invalid credentials please check your password";
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: statusCode }
      );
    }
  };
  public verifyEmail = async (oobCode: string) => {
    try {
      const actionCodeInfo = await checkActionCode(auth, oobCode);

      if (!actionCodeInfo.data.email) {
        throw new Error("No email associated with this verification link");
      }
      const userRecord = await adminAuth.getUserByEmail(
        actionCodeInfo.data.email
      );
      await applyActionCode(auth, oobCode);
      await adminAuth.updateUser(userRecord.uid, {
        emailVerified: true,
      });

      await setDoc(
        doc(db, "users", userRecord.uid),
        {
          emailVerified: true,
          status: "active",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        message: "Email verified successfully. You can now login.",
      });
    } catch (error) {
      console.error("Verification error:", error);
      let errorMessage = "Verifying email failed";
      let statusCode = 400;
      if ((error as { code: string }).code === "auth/too-many-requests") {
        errorMessage = "Too many request, Please try again later.";
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: statusCode }
      );
    }
  };
  public resendVerification = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        return NextResponse.json(
          {
            message: "A new verification link has been sent.",
            requiresVerification: true,
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      let errorMessage = "Sending email verification failed";
      let statusCode = 400;
      if ((error as { code: string }).code === "auth/too-many-requests") {
        errorMessage = "Too many request, Please try again later.";
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: statusCode }
      );
    }
  };
}

export default AuthService;
