# Mali Frontend

Mali is a mobile-first financial intelligence app focused on Kenya. It tracks real-world economic signals such as fuel prices, food inflation, forex movement, taxes, and electricity costs, then translates them into practical insights people can understand and act on.

The frontend is built with Expo and React Native and is responsible for the user experience across onboarding, personalized dashboards, AI chat, alerts, and economic impact visualizations.

## What the App Does

- Explains economic events in plain language.
- Shows users how changes in the market may affect cost of living and business decisions.
- Provides a curated economic feed and impact-focused dashboards.
- Offers an AI chat experience for asking questions about money, markets, and everyday impact.
- Supports authentication, profile management, and notifications.

## Core Screens

- Home dashboard
- Impact analytics
- Ask Mali chat
- Economic feed
- Profile
- Notifications
- Authentication flow for sign in, sign up, password reset, and verification

## Tech Stack

- Expo 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router for file-based navigation
- NativeWind for utility-first styling
- Gluestack UI for UI primitives
- Redux Toolkit for app state
- Axios for API access
- Firebase Authentication
- EAS Build for app delivery

## Project Structure

```text
app/                    Route-based screens using Expo Router
  (auth)/               Authentication flow
  (tabs)/               Main tab navigation
assets/                 Icons, backgrounds, animations, and app imagery
authentication/         Firebase auth setup and auth error handling
components/             Shared UI and feature-specific components
constants/              Theme and font constants
contexts/               Shared React contexts such as theming
hooks/                  Feature hooks for auth, dashboard, feed, impact, and profile
redux/                  Global store and slices
services/               API clients and service integrations
scripts/                Local utility scripts
```

## Navigation Overview

The application uses Expo Router with grouped routes:

- `app/(auth)` contains the authentication experience.
- `app/(tabs)` contains the main authenticated tab layout.
- `app/mali-chat.tsx` is opened as a fullscreen route from the Ask Mali tab.
- `app/notifications.tsx` provides the notifications screen outside the tab layout.

Main tabs currently include:

- Home
- Impact
- Ask Mali
- Feed
- Profile

## Getting Started

### Prerequisites

- Node.js 18 or later recommended
- npm
- Xcode for iOS simulator development on macOS
- Android Studio for Android emulator development
- Expo CLI via `npx expo`

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
npm run start
```

You can also run platform-specific commands:

```bash
npm run ios
npm run android
npm run web
```

## Environment Configuration

This project expects Expo public environment variables for Firebase and the backend API.

Required variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_API_BASE_URL_DEV=
EXPO_PUBLIC_API_BASE_URL_PROD=
```

These values are consumed by:

- `authentication/firebase-config.ts`
- `services/api.ts`

If the Firebase values are missing, the app will fail early during initialization.

## Firebase Setup

The app is configured to use Firebase Authentication.

Local native config files used by the project:

- `GoogleService-Info.plist`
- `google-services.json`

For EAS or CI builds, `app.config.ts` also supports injecting these files from base64-encoded secrets:

```bash
IOS_FIREBASE_BASE64=
ANDROID_FIREBASE_BASE64=
```

If those secrets are present, the config writes the decoded files during build setup.

## Build and Release

This repository includes EAS configuration in `eas.json`.

Available build profiles:

- `development`
- `mali-stagging`
- `mali-production`

Examples:

```bash
eas build --platform ios --profile development
eas build --platform android --profile mali-production
```

App identifiers configured in `app.config.ts`:

- iOS bundle identifier: `com.pyra.mali`
- Android package: `com.pyra.mali`

## Quality Checks

Run linting with:

```bash
npm run lint
```

## Development Notes

- Routing is file-based through Expo Router.
- The app uses typed routes and React Compiler experiments in Expo config.
- Theming is shared through the theme context and reused across tabs and screens.
- API access is centralized through the Axios client in `services/api.ts`.

## Contributing

1. Install dependencies.
2. Configure the required environment variables.
3. Run the app locally.
4. Lint before opening a pull request.
5. Keep new features aligned with the existing route, hook, and component structure.

## Useful Commands

```bash
npm run start
npm run ios
npm run android
npm run web
npm run lint
npm run reset-project
```

## Reference

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [EAS documentation](https://docs.expo.dev/eas/)
- [Firebase Authentication docs](https://firebase.google.com/docs/auth)
