import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  User,
  UserCredential,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential  
} from 'firebase/auth';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { FireBaseAuth } from './firebase-config';
import { formatFirebaseError, getErrorSeverity } from './firebase-error-handler';

const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured) return;

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
  });

  googleConfigured = true;
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      FireBaseAuth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}

/**
 * Sign in user with email and password, returns Firebase ID token
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<string> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      FireBaseAuth,
      email,
      password
    );
    const token: string = await userCredential.user.getIdToken();
    return token;
  } catch (error: any) {
    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}

/**
 * Web-only Google sign-in via popup
 */
export async function loginWithGoogleWeb(): Promise<{ token: string; email: string }> {
  try {
    if (Platform.OS !== 'web') {
      throw new Error('Use native Google flow on mobile.');
    }

    const result: UserCredential = await signInWithPopup(FireBaseAuth, googleProvider);
    const token = await result.user.getIdToken();
    const email = result.user.email ?? '';

    return { token, email };
  } catch (error: any) {
    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}

/**
 * Native Google sign-in via @react-native-google-signin/google-signin
 */
export async function loginWithGoogleNative(): Promise<{ token: string; email: string, firebase_uid: string, fullname:string, photo_url:string }> {
  try {
    if (Platform.OS === 'web') {
      throw new Error('Use web Google flow on web.');
    }

    ensureGoogleConfigured();

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    await GoogleSignin.signOut().catch(() => undefined);
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token returned from Google.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(FireBaseAuth, credential);
    
    const token = await userCredential.user.getIdToken();
    const email = userCredential.user.email ?? '';
    const firebase_uid = userCredential.user.uid ?? '';
    const fullname = userCredential.user.displayName ?? '';
    const photo_url = userCredential.user.photoURL ?? '';

    return { token, email, firebase_uid, fullname, photo_url };
  } catch (error: any) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw { code: error?.code, message: 'Google sign-in was cancelled.', status: 'error' };
    }

    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}

/**
 * Sign out current user
 */
export async function firebaseLogout(): Promise<void> {
  try {
    await signOut(FireBaseAuth);
    if (Platform.OS !== 'web') {
      await GoogleSignin.signOut().catch(() => undefined);
    }
  } catch (error: any) {
    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}

/**
 * Get currently authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  return FireBaseAuth.currentUser;
}


/**
 * Reauthenticate and update password for currently authenticated email/password user
 */
export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<User> {
  try {
    const currentUser = FireBaseAuth.currentUser;

    if (!currentUser || !currentUser.email) {
      throw new Error('No authenticated Firebase user found.');
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword.trim()
    );

    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword.trim());

    return currentUser;
  } catch (error: any) {
    console.log(error);
    throw {
      code: error?.code,
      message: formatFirebaseError(error),
      status: getErrorSeverity(error),
    };
  }
}
