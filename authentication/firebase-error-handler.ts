/**
 * Firebase authentication error messages mapping
 * Converts Firebase error codes to user-friendly messages
 */

interface FirebaseErrorMessageMap {
  [key: string]: string;
}

const firebaseErrorMessages: FirebaseErrorMessageMap = {
  // User not found
  "auth/user-not-found": "No account found with this email address. Please sign up first.",
  
  // Invalid password
  "auth/wrong-password": "Incorrect password. Please try again.",
  
  // Invalid credentials (generic)
  "auth/invalid-credential": "Invalid email or password. Please check and try again.",
  
  // Email already in use
  "auth/email-already-in-use": "This email is already registered. Please use a different email or log in.",
  
  // Weak password
  "auth/weak-password": "Password is too weak. Please use a stronger password (at least 6 characters).",
  
  // Invalid email
  "auth/invalid-email": "Please enter a valid email address.",
  
  // User disabled
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  
  // Too many login attempts
  "auth/too-many-requests": "Too many login attempts. Please try again later.",
  
  // Operation not allowed
  "auth/operation-not-allowed": "This operation is not allowed. Please contact support.",
  
  // Network request failed
  "auth/network-request-failed": "Network error. Please check your internet connection.",
  
  // Popup closed by user
  "auth/popup-closed-by-user": "Sign in popup was closed. Please try again.",
  
  // Popup request cancelled
  "auth/cancelled-popup-request": "Sign in request was cancelled. Please try again.",
  
  // Account exists with different credential
  "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  
  // Invalid API key
  "auth/invalid-api-key": "Invalid Firebase configuration. Please contact support.",
  
  // App not authorized
  "auth/app-not-authorized": "This application is not authorized. Please contact support.",

  // Changing Password
  "auth/requires-recent-login": "For security, please confirm your current password and try again.",
};

/**
 * Format Firebase error into user-friendly message
 * @param error - Error object from Firebase
 * @returns Formatted error message
 */
export function formatFirebaseError(error: any): string {
  // Check if error has a code property (Firebase error)
  if (error?.code) {
    const errorCode = error.code;
    
    // Return mapped message if exists
    if (firebaseErrorMessages[errorCode]) {
      return firebaseErrorMessages[errorCode];
    }
    
    // Extract readable text from error code (auth/error-code -> Error code)
    const readableCode = errorCode
      .split("/")[1] // Get part after "auth/"
      ?.split("-")
      .map((word:string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    return readableCode ? `${readableCode}. Please try again.` : "An authentication error occurred. Please try again.";
  }
  
  // Check for custom error messages
  if (error?.message) {
    return error.message;
  }
  
  // Fallback
  return "An error occurred. Please try again.";
}

/**
 * Get error severity level for UI treatment
 * @param error - Error object from Firebase
 * @returns Severity level: "error" | "warning" | "info"
 */
export function getErrorSeverity(error: any): "error" | "warning" | "info" {
  const code = error?.code;

  // Warnings (user can retry)
  if (
    code === "auth/too-many-requests" ||
    code === "auth/weak-password" ||
    code === "auth/wrong-password"
  ) {
    return "warning";
  }

//   Info (informational)
  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  ) {
    return "info";
  }

  // Errors (critical issues)
  return "error";
}
