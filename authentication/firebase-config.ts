import { initializeApp, FirebaseApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth,  
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

// Firebase configuration from .env
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const requiredKeys: (keyof FirebaseConfig)[] = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missingKeys: string[] = requiredKeys.filter(
    (key) => !config[key] || config[key] === ""
  );

  if (missingKeys.length > 0) {
    console.error(
      "Firebase configuration is incomplete. Missing keys:",
      missingKeys
    );
    throw new Error(
      `Firebase configuration incomplete. Missing: ${missingKeys.join(", ")}`
    );
  }
};

validateFirebaseConfig(firebaseConfig);

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth with best-effort React Native persistence.
// Some firebase versions don't type-export getReactNativePersistence.
let auth: Auth;

try {
  const authModule = require("firebase/auth") as {
    getReactNativePersistence?: (storage: unknown) => unknown;
  };

  if (authModule.getReactNativePersistence) {
    auth = initializeAuth(app, {
      persistence: authModule.getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } else {
    // Fallback when helper is not present in this firebase build.
    auth = getAuth(app);
  }
} catch {
  // If Auth was already initialized (e.g., hot reload), reuse existing instance.
  auth = getAuth(app);
}

// Export singleton auth instance
export const FireBaseAuth: Auth = auth;