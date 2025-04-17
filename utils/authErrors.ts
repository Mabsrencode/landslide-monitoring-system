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
      message = "Invalid credentials, please check your password";
      break;
  }

  return { message, status };
}
