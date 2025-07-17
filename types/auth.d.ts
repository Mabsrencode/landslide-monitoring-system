declare type FirebaseAuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/too-many-requests"
  | "auth/invalid-credential"
  | "auth/expired-action-code"
  | "auth/invalid-action-code"
  | string;

interface UserCredential {
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  id: string;
  profileImage: string;
  emailVerified: boolean;
  role?: string | null;
  status: "active" | "inactive";
}
type AuthLoginResponse = {
  message: string;
  data: UserCredential | null;
};

type ChangePassFormTypes = {
  id: string;
  currentPassword: string;
  password: string;
  cpassword: string;
  newPassword: string;
};
