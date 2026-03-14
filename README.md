# MyGuest v2 Frontend

Mobile-first client management app for stylists, built with Expo Router + Tamagui.

This repo is the frontend source of truth. Pair it with
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back` for real API work,
or run it in tracked mock mode for UI-focused development.

## Supported Workflows

### 1. Clean mock-mode development

Use this when you want a deterministic local app without backend auth/setup:

```bash
npm install
EXPO_PUBLIC_USE_MOCK_DATA=true npm run dev
```

Mock mode now uses tracked fixtures under `components/data/mock/` and the shared
`components/data/source.ts` boundary. No ignored local mock file is required.

### 2. Real backend development

Create `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=<firebase-web-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<firebase-web-app-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<google-ios-client-id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<google-android-client-id>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<google-web-client-id>
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Then run:

```bash
npm run dev
```

Notes:

- `npm run dev` uses a tunnel by default because it is more reliable on a physical iPhone.
- `npm run dev:lan` is optional when your Mac and phone are on the same Wi-Fi.
- `EXPO_PUBLIC_DEV_ID_TOKEN` is still supported for one-off local API debugging.

## Quality Gate

Run these before shipping or opening a PR:

```bash
npm run typecheck
npm run lint
npm run test:smoke
```

What they cover:

- `typecheck`: `tsc --noEmit`
- `lint`: repo-wide Expo/TypeScript lint pass
- `test:smoke`: tracked mock-mode web export smoke tests

GitHub Actions mirrors the same commands in `.github/workflows/ci.yml`.

## iPhone Development

```bash
npm run ios:rebuild
npm run dev
```

Use `npm run ios:rebuild` only when setting up the phone, after native dependency
or app config changes, or when the dev build expires. For normal day-to-day work,
`npm run dev` is the main command.

## Troubleshooting iOS Dev Builds

- **Build fails: “No profiles for bundle id …”**
  - Open `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/ios/exporouterexample.xcworkspace` in Xcode.
  - Target: `exporouterexample` → Signing & Capabilities → “Automatically manage signing” ON → select your Team.
  - Build once in Xcode, then retry `npm run ios:rebuild`.
- **App won’t launch: “profile not trusted / invalid code signature”**
  - On the phone: Settings → Privacy & Security → Developer Mode.
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
- `npm test` runs the full Playwright suite.
- `npm run audit:ui` runs the UI consistency audit.

## Project Map

- `app/` - routes and route-level UI
- `components/data/models.ts` - tracked domain models shared by API, mock data, and hooks
- `components/data/mock/` - tracked mock fixtures
- `components/data/source.ts` - runtime boundary for `mock` vs `api`
- `components/data/sources/` - data-source implementations
- `components/data/queries/` - split React Query modules by concern
- `components/state/` - persisted Zustand stores for UI and preferences
- `components/ui/` - reusable controls and themed primitives

## Stack

- Expo + React Native
- Expo Router
- Tamagui
- React Query
- Zustand
- Playwright

## Disposable Local Artifacts

These paths are generated local output and should not be treated as source:

- `ios/`
- `android/`
- `.expo/`
- `.tamagui/`
- `dist/`
- `playwright-report/`
- `test-results/`

If prebuild or native tooling leaves duplicate-suffixed files inside generated
native folders, treat them as disposable and regenerate rather than editing them.
