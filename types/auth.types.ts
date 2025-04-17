declare type FirebaseAuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/weak-password"
  | "auth/too-many-requests"
  | "auth/invalid-credential"
  | string;
