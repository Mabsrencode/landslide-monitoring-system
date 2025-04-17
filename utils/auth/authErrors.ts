export function getFirebaseAuthError(code: FirebaseAuthErrorCode) {
  let message = "An unknown error occurred";
  let status = 400;

  switch (code) {
    case "auth/email-already-in-use":
      message = "Email already in use";
      break;
    case "auth/invalid-email":
      message = "Invalid email address";
      break;
    case "auth/weak-password":
      message = "Password is too weak";
      break;
    case "auth/too-many-requests":
      message = "Too many requests. Please try again later.";
      break;
    case "auth/invalid-credential":
      message = "Invalid credentials, please check your email or password";
      break;
    case "auth/expired-action-code":
      message = "The reset link has expired. Please request a new one.";
      break;
    case "auth/invalid-action-code":
      message = "Invalid reset link. Please request a new one.";
      break;
  }

  return { message, status };
}
