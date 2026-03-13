# MyGuest v2

Mobile-first client management app for stylists, built with Expo Router + Tamagui.

## iPhone Development

```bash
npm install
npm run ios:rebuild
npm run dev
```

Use `npm run ios:rebuild` only when setting up the phone, after native dependency or app config changes, or when the dev build expires. For normal day-to-day work, `npm run dev` is the main command.

Notes:

- `npm run dev` uses a tunnel by default because it is more reliable on a physical iPhone.
- In tunnel mode, the app may still say `No development servers found`. That is normal. Tap `Enter URL manually` and paste the full `Metro waiting on ...` URL from the terminal.
- `npm run dev:lan` is optional when your Mac and phone are on the same Wi-Fi and you want the fastest local connection.
- `npm run dev:clean` is the reset button for Metro cache issues.
- `npm run ios:rebuild:clean` regenerates the native projects before rebuilding and is the nuclear option when config gets out of sync.
- The dev build stays installed on your phone between sessions.
- With a free Apple ID, dev builds typically expire after about 7 days.

## Troubleshooting iOS Dev Builds

- **Build fails: “No profiles for bundle id …”**
  - Open `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/ios/exporouterexample.xcworkspace` in Xcode.
  - Target: `exporouterexample` → Signing & Capabilities → “Automatically manage signing” ON → select your Team.
  - Build once in Xcode, then retry `npm run ios:rebuild`.
- **App won’t launch: “profile not trusted / invalid code signature”**
  - On the phone: Settings → Privacy & Security → Developer Mode (enable + reboot if needed).
  - Settings → General → VPN & Device Management → trust your Apple ID.
  - Delete the app from the phone and re-run `npm run ios:rebuild`.
- **Bundler error: “Unable to resolve ansi-styles” or other missing modules**
  - Run `npm run dev:clean` to clear Metro cache.
  - If it persists: delete `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/node_modules` and run `npm install`.
- **The app says “No development servers found” or tries `localhost:8081`**
  - Make sure `npm run dev` is still running on your Mac.
  - In `MyGuest Dev`, tap `Enter URL manually` and paste the exact `Metro waiting on ...` URL from the terminal.
  - If local networking is stable, use `npm run dev:lan` instead.
- **The dev app still shows old names or old schemes**
  - Run `npm run ios:rebuild:clean` and reinstall the app on the phone.

## Other Commands

- `npm run android` runs the Android native build.
- `npm run web` starts the web target locally.
- `npm run build:web` exports the web build to `dist/`.
- `npm test` runs the Playwright suite.
- `npm run audit:ui` runs the UI consistency audit.

## Stack

- Expo + React Native
- Expo Router (file-based routing)
- Tamagui (design system + primitives)
- React Query (data access boundary)
- Zustand (persisted UI/preferences state)
- Playwright (web export smoke test)

## Live v2 API (Dev)

To use real data from your v2 backend with automatic Firebase login/token refresh,
create `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://myguestv2back.onrender.com/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=<firebase-web-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<firebase-web-app-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<google-ios-client-id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<google-android-client-id>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<google-web-client-id>
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Notes:

- Google login works on web and native via Firebase + Expo Auth Session.
- The app will call `POST /auth/sync` automatically before protected API reads/writes.
- Set `EXPO_PUBLIC_USE_MOCK_DATA=true` to force local mock collections.
- `EXPO_PUBLIC_DEV_ID_TOKEN` is still supported as a fallback for one-off testing.

## Project Map

- `app/` - routes and route-level UI (Expo Router)
- `components/` - shared UI, forms, providers, stores, query hooks
- `components/data/queries.ts` - central query hooks used by screens
- `components/state/` - persisted Zustand stores for UI and preferences

## Data Flow

- Screens read entities through React Query hooks (`useClients`, `useAppointmentHistory`, etc).
- Local edits currently patch React Query cache directly (optimistic/local-first behavior).
- Cross-screen UI preferences (filters, theme, dashboard layout, app settings) live in persisted Zustand stores.

## Notes

- `ios/` and `android/` are generated prebuild/run artifacts and are ignored in git here.
- `components/AmbientBackdrop.tsx` is intentionally a placeholder so background treatment can be reintroduced globally in one place.
