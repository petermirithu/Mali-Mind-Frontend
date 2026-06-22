import fs from 'fs';
import path from 'path';
import type { ExpoConfig } from 'expo/config';

const writeBase64File = (secretName: string, filename: string): string | undefined => {
  const secret = process.env[secretName];
  const filePath = path.join(process.cwd(), filename);

  if (secret) {
    fs.writeFileSync(filePath, Buffer.from(secret, 'base64'));
    return `./${filename}`;
  }

  if (fs.existsSync(filePath)) {
    return `./${filename}`;
  }

  return undefined;
};

const iosGoogleServicesFile = writeBase64File(
  'IOS_FIREBASE_BASE64',
  'GoogleService-Info.plist'
);

const androidGoogleServicesFile = writeBase64File(
  'ANDROID_FIREBASE_BASE64',
  'google-services.json'
);

const config: ExpoConfig = {
  name: 'Mali',
  slug: 'mali',
  owner: 'pyra',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/app-icons/icon.png',
  scheme: 'mali',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/app-icons/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#0000',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  updates: {
    url: 'https://u.expo.dev/900ca500-a15e-485b-8773-c5fb4a70aff6',
    fallbackToCacheTimeout: 6000,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.pyra.mali',
    googleServicesFile: iosGoogleServicesFile,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.pyra.mali',
    googleServicesFile: androidGoogleServicesFile,
    adaptiveIcon: {
      backgroundColor: '#000000',
      foregroundImage: './assets/app-icons/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/app-icons/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/app-icons/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#000000',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          useModularHeaders: true,
        },
      },
    ],
    '@react-native-google-signin/google-signin',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '900ca500-a15e-485b-8773-c5fb4a70aff6',
    },
  },
};

export default config;