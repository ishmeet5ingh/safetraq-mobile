# SafeTraq Mobile

SafeTraq Mobile is the React Native client for a personal-safety app built around consent-based live location sharing, trusted circles, and emergency escalation.

The app is designed for real-life movement:
- start a temporary live share before a commute or trip
- share only with selected circles
- stop sharing at any time
- trigger SOS when help is needed
- keep privacy controls visible instead of hidden in settings

## Core Product Idea

SafeTraq helps a user stay connected to people they trust while traveling, commuting, or moving through situations where extra visibility matters.

The mobile app focuses on:
- onboarding and authentication
- trusted circle creation and member invites
- live session setup and management
- map-based active session tracking
- privacy defaults for future sessions
- emergency SOS flows

## Main Features

### Authentication
- landing experience with branded onboarding
- unified login and registration flow
- persisted auth restoration on app launch

### Trusted Circles
- create circles for family, partner, friends, or team
- invite members by email
- review pending invitations
- open circle details and share directly with a selected circle

### Live Sharing
- start a time-bound live session
- choose a target circle
- update location in real time
- view current session status and map markers
- pause, resume, or stop a session

### Privacy and Safety
- default sharing duration
- battery-aware tracking mode
- arrival prompt preference
- audit visibility preference
- emergency SOS trigger with current location

### UX and Branding
- dark and light theme support
- custom SafeTraq app icon and launch branding
- professional bottom-tab navigation
- Tailwind-style UI via NativeWind

## Tech Stack

- React Native 0.84
- TypeScript
- React Navigation
- Redux Toolkit
- NativeWind
- Axios
- Socket.IO client
- `react-native-geolocation-service`
- `react-native-webview` for the Leaflet map surface

## Project Structure

```text
src/
  api/                Axios setup
  components/         Shared UI pieces such as the map
  context/            Theme context
  hooks/              Redux hooks
  navigation/         Stack and tab navigators
  screens/            App screens
  services/           API, socket, and location services
  store/              Redux store and slices
  types/              Shared TypeScript types
  utils/              Constants and Leaflet HTML
assets/
  branding/           SafeTraq logo and generated brand assets
```

## Important Screens

- `LandingScreen`: first-touch branded onboarding
- `AuthScreen`: login and registration
- `HomeScreen`: dashboard for live share, circles, invites, and privacy
- `LiveShareSetupScreen`: create a live share session
- `ActiveSessionScreen`: map and controls for an active session
- `CirclesScreen`: create and manage trusted circles
- `CircleDetailScreen`: invite people and share with one circle
- `InvitesScreen`: accept or decline incoming invites
- `PrivacyDashboardScreen`: default privacy and safety controls
- `SOSScreen`: emergency escalation flow

## Development Setup

### Prerequisites

- Node.js `>= 22.11.0`
- React Native Android/iOS environment set up
- Xcode and CocoaPods for iOS
- Android Studio for Android

### Install dependencies

```sh
npm install
```

### Start Metro

```sh
npm start
```

If NativeWind or asset changes are not reflecting correctly:

```sh
npm start -- --reset-cache
```

## Run the App

### Android

```sh
npm run android
```

If native assets, permissions, or launcher icons changed:

```sh
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS

```sh
cd ios
pod install
cd ..
npm run ios
```

## Backend Connection

This client expects the SafeTraq backend to be running separately.

The app communicates with the backend for:
- auth
- circles and invites
- live session lifecycle
- SOS submission
- socket-based live updates

Review the API base URL in:
- [src/api/axios.ts](/Users/ishmeetsingh/Desktop/safetraq/safetraq-mobile/src/api/axios.ts)

## Useful Commands

```sh
npm run android
npm run ios
npm start
npm test
npx tsc --noEmit
```

## Current Product Direction

SafeTraq is not a public-map social app.

It is a privacy-aware safety product built around:
- temporary visibility
- trusted relationships
- explicit sharing
- revocable access
- emergency escalation when needed

## Notes

- Location permissions must be granted for live sharing and SOS location capture.
- App icon, launch logo, and in-app branding are customized for SafeTraq.
- Bottom tabs are defined in:
  - [MainTabsNavigator.tsx](/Users/ishmeetsingh/Desktop/safetraq/safetraq-mobile/src/navigation/MainTabsNavigator.tsx)
