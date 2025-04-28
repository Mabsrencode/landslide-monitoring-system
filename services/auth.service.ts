import { adminAuth } from "@/lib/firebase/admin";
import { auth, db, doc, firebaseConfig, setDoc } from "@/lib/firebase/config";
import { nowISOString } from "@/utils/date";
import { jsonRes, errorRes } from "@/utils/auth/authApiResponse";
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from "firebase/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

class AuthService {
  private static instance: AuthService;
  public static getInstance = () => {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  };
  public sendOtp = async (phoneNumber: string, recaptchaToken: string) => {
    try {
      if (!phoneNumber) {
        return NextResponse.json(
          { message: "Phone number is required" },
          { status: 400 }
        );
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${firebaseConfig.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber,
            recaptchaToken,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return jsonRes({
        success: true,
        message: "OTP sent successfully.",
        sessionInfo: data.sessionInfo,
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      return errorRes(error);
    }
  };

  public verifyOtp = async (sessionInfo: string, code: string) => {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${firebaseConfig.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionInfo,
            code,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return jsonRes({
        success: true,
        idToken: data.idToken,
        phoneNumber: data.phoneNumber,
        message: "OTP verified successfully.",
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return errorRes(error);
    }
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
        createdAt: nowISOString(),
        updatedAt: nowISOString(),
      });

      await sendEmailVerification(user);
      return jsonRes({
        message: "Verification email sent. Please check your inbox.",
        requiresVerification: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return errorRes(error);
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
        return jsonRes(
          {
            message:
              "Email not verified. A new verification link has been sent.",
            requiresVerification: true,
          },
          401
        );
      }

      const token = await user.getIdToken();
      const response = NextResponse.json(
        {
          message: "Login successful",
          data: {
            email: user.email,
            name: user.displayName,
            id: user.uid,
            profileImage: user.photoURL,
            emailVerified: user.emailVerified,
          },
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
      return errorRes(error);
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
          updatedAt: nowISOString(),
        },
        { merge: true }
      );

      return jsonRes({
        success: true,
        message: "Email verified successfully. You can now login.",
      });
    } catch (error) {
      console.error("Verification error:", error);
      return errorRes(error);
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
        return jsonRes({
          message: "A new verification link has been sent.",
          requiresVerification: true,
        });
      }
      return jsonRes({ message: "Email already verified" });
    } catch (error) {
      console.error("Resend verification error:", error);
      return errorRes(error);
    }
  };

  public sendPasswordResetEmail = async (email: string) => {
    try {
      if (!email) {
        return NextResponse.json(
          { message: "Email is required" },
          { status: 400 }
        );
      }

      await sendPasswordResetEmail(auth, email);
      return jsonRes({
        message: "Password reset email sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return errorRes(error);
    }
  };
  public confirmPasswordReset = async (
    oobCode: string,
    newPassword: string
  ) => {
    try {
      if (!oobCode || !newPassword) {
        return NextResponse.json(
          { message: "Reset code and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      await confirmPasswordReset(auth, oobCode, newPassword);
      return jsonRes({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      return errorRes(error);
    }
  };

  public logout = async () => {
    try {
      await auth.signOut();
      const cookieStore = await cookies();
      cookieStore.delete("bantay-access-tk");
      return jsonRes({ message: "Logout successful" }, 200);
    } catch (error) {
      console.error("Logout error:", error);
      return errorRes(error);
    }
  };
}
export default AuthService;
