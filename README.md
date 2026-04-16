# MyGuest Frontend

Mobile-first client management app for stylists, built with Expo Router + Tamagui.

This repo is the frontend source of truth. Pair it with
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back` for real API work,
or run it in tracked mock mode for UI-focused development.

For the launch-oriented lane strategy now that the paid Apple Developer account
is active, use
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/mvp-development-pathways.md`
as the operating guide.

## Table Of Contents

- [Supported Workflows](#supported-workflows)
- [Quality Gate](#quality-gate)
- [Local Toolchain](#local-toolchain)
- [iOS Development Paths](#ios-development-paths)
- [Simulator Development On Mac](#simulator-development-on-mac)
- [iPhone Development](#iphone-development)
- [iPhone Development Over Tunnel](#iphone-development-over-tunnel)
- [Away From Your Mac](#away-from-your-mac)
- [iOS Release Prep](#ios-release-prep)
- [Troubleshooting iOS Dev Builds](#troubleshooting-ios-dev-builds)
- [Other Commands](#other-commands)
- [Project Map](#project-map)
- [Stack](#stack)
- [Disposable Local Artifacts](#disposable-local-artifacts)

Key repo docs:

- [`docs/README.md`](docs/README.md) for the frontend docs index
- [`docs/mvp-development-pathways.md`](docs/mvp-development-pathways.md) for the cross-repo development and release lanes
- [`docs/apple-auth-checkpoint.md`](docs/apple-auth-checkpoint.md) for the current Apple sign-in checkpoint and remaining auth risks
- [`docs/ios-launch-readiness.md`](docs/ios-launch-readiness.md) for release-prep and App Store submission guidance

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
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://example.com/privacy
EXPO_PUBLIC_SUPPORT_URL=https://example.com/support
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Then run:

```bash
npm run dev
```

Notes:

- `EXPO_PUBLIC_API_BASE_URL` is required when `EXPO_PUBLIC_USE_MOCK_DATA=false`; the app no longer falls back to the hosted backend implicitly.
- `npm run dev` uses the local network by default because it is the simplest daily iPhone workflow.
- `npm run dev:sim` uses `localhost` and is the fastest loop when you are working in the iOS Simulator on your Mac.
- `npm run dev:tunnel` is the fallback when the same-Wi-Fi path is acting up.
- `EXPO_PUBLIC_PRIVACY_POLICY_URL` and `EXPO_PUBLIC_SUPPORT_URL` power the in-app Data & Privacy section and should point at real public pages for release builds.
- Real API mode now requires a signed-in Firebase user; there is no public bearer-token fallback in the Expo bundle.

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

## Local Toolchain

Before running iOS builds, use the repo's pinned Node line:

```bash
nvm use
```

If `nvm use` says the version is not installed yet, install any Node 20 release
from the supported line and keep the
same app commands you already use:

```bash
nvm install 20
nvm use 20
npm install
```

If `nvm` is not installed on your machine, use any Node version manager you
prefer and target the same version from `.nvmrc` / `.node-version` instead.
The target line is Node `20.x` with a minimum of `20.19.0`. This project now includes both files for
Expo SDK 54 compatibility, plus an empty `.watchmanconfig` so Watchman treats
the app root as a stable project.

Install dependencies before first run:

```bash
npm install
```

After that, the daily dev paths stay the same:

```bash
npm run dev
npm run dev:tunnel
npm run ios:device
```

## iOS Development Paths

This repo supports four main iOS paths:

- **Simulator on Mac**: fastest day-to-day loop for UI and navigation work.
- **Physical iPhone on same Wi-Fi**: best path for camera, gestures, auth, and real-device checks while your Mac is nearby.
- **Physical iPhone over tunnel**: fallback when LAN discovery is flaky or you are off the local network.
- **Away from your Mac**: installable preview/TestFlight path that does not need Metro or your laptop running.

## Simulator Development On Mac

```bash
npm run ios
npm run dev:sim
```

Use the simulator loop for most day-to-day UI, navigation, and state work.

What to expect:

- `npm run ios` installs or refreshes the local development build in the iOS Simulator.
- `npm run dev:sim` keeps Metro on `localhost`, which avoids Wi-Fi and QR-code issues entirely.
- Open `MyGuest Dev` in the simulator after Metro starts.
- Re-run `npm run ios:sim:clean` only after native dependency changes or app config changes.

## iPhone Development

```bash
npm run ios:device:clean
npm run dev
```

Use `npm run ios:device:clean` the first time you install the local phone build,
after native dependency changes, after app config changes, or when the dev build
expires. It regenerates the native iPhone project as `MyGuest Dev` and removes
the local Sign in with Apple entitlement so the standard local dev lane stays
simple to sign and reinstall.

After the app is installed, `npm run dev` is the main day-to-day command.

What to expect:

- Keep the `npm run dev` terminal open while you work.
- Make sure your Mac and iPhone are on the same Wi-Fi.
- Open `MyGuest Dev` on your iPhone.
- If this is the first local install, trust your Apple ID profile on the phone:
  `Settings > Privacy & Security > Developer Mode`, then
  `Settings > General > VPN & Device Management`.
- If the dev server does not auto-appear in the app, tap `Enter URL manually` and paste the exact `Metro waiting on ...` URL from the terminal.
- Do not rely on the QR code as the main local-iPhone workflow. Opening `MyGuest Dev` directly is more reliable once the dev build is installed.
- If LAN is flaky, switch to `npm run dev:tunnel`.
- After the first successful install, `npm run ios:device` is usually enough for refreshes or re-installs.
- `npm run ios:rebuild` still works as a legacy alias for `npm run ios:device`.

If you want the closest local path to a shipping-capabilities build now that the
paid Apple Developer account is active, use:

```bash
npm run ios:device:release-like:clean
npm run dev
```

That keeps Sign in with Apple enabled in the local device build so auth and
capabilities are closer to what preview/TestFlight will use.

## iPhone Development Over Tunnel

```bash
npm run dev:tunnel
```

Use this when:

- your Mac and iPhone are not on the same Wi-Fi
- LAN discovery is unreliable
- you need a quick off-network dev-client session while your Mac stays running

What to expect:

- Keep the `npm run dev:tunnel` terminal open.
- Open `MyGuest Dev` on the phone directly.
- If the app does not auto-detect the server, use `Enter URL manually` with the Expo URL shown in the terminal.
- The QR code is optional here too; it only helps after the dev build is already installed.
- Tunnel mode still depends on your Mac staying awake with Metro running.

## Away From Your Mac

For dogfooding or showing the app when your computer is off or nowhere nearby,
use an EAS preview build instead of a dev server.

```bash
npm run eas:login
npm run eas:device:create
npm run eas:build:ios:preview
```

What this gives you:

- An installable iPhone build that launches without Metro or your Mac running.
- A shareable build link for your phone or other registered test devices.
- A cleaner path for real-world testing on cellular, travel Wi-Fi, or away from your desk.
- The right path once your paid Apple Developer membership is fully active and you want Apple Sign In enabled end to end.

Important limits:

- iOS internal distribution still needs a paid Apple Developer account and a registered device UDID.
- Preview/TestFlight builds need a hosted backend. If `EXPO_PUBLIC_API_BASE_URL` still points at `127.0.0.1`, the app will only work in mock mode away from your Mac.
- Preview builds in this repo currently reuse the production bundle identifier for the simplest Apple/Google auth setup, so installing one replaces any existing MyGuest install on that iPhone.

Once the preview app is already installed, this is the main JS-only path for
pushing a live preview fix without rebuilding the binary:

```bash
npm run eas:update:preview:ios -- --message "Describe the JS-only preview fix"
```

Use that script for JavaScript, styling, copy, or image changes. After
publishing, fully quit and reopen the preview app while online so it can pull
the update. If you changed native dependencies, entitlements, app config,
permissions, or environment wiring, build a new preview binary instead.

The detailed setup and EAS Update workflow lives in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-preview-distribution.md`.
The higher-level lane strategy and environment separation guide lives in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/mvp-development-pathways.md`.

## iOS Release Prep

The tracked release guide lives in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-launch-readiness.md`.
Use that file for production identity, Sign in with Apple, privacy/support URLs,
local archive expectations, and App Review prep. Keep any sensitive review
credentials or submission answers in the local-only
`APP_STORE_SUBMISSION_CHECKLIST.local.md` file instead of committing them.

## Troubleshooting iOS Dev Builds

- **Build fails: “No Account for Team …” or “No profiles for bundle id …”**
  - In Xcode, open Settings → Accounts and sign in with the Apple ID you want to use for device builds.
  - For the local phone dev build, open `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/ios/MyGuestDev.xcworkspace` in Xcode.
  - App target → Signing & Capabilities → “Automatically manage signing” ON → select your Team.
  - Build once in Xcode so it can register the device and create the development profile, then retry `npm run ios:device`.
- **Build fails because Personal Team does not support Sign in with Apple**
  - Use `npm run ios:device:clean` for the local phone development build.
  - That command now regenerates the `MyGuest Dev` native project and strips the local Apple Sign In entitlement automatically.
  - If you want the closest local release-style auth path, switch to `npm run ios:device:release-like:clean`.
- **App won’t launch: “profile not trusted / invalid code signature”**
  - On the phone: Settings → Privacy & Security → Developer Mode.
  - Settings → General → VPN & Device Management → trust your Apple ID.
  - Delete the app from the phone and re-run `npm run ios:device`.
- **Expo says “No development build is installed”**
  - Run `npm run ios` for the simulator or `npm run ios:device:clean` for a physical iPhone first.
- **Bundler error: “Unable to resolve ansi-styles” or other missing modules**
  - Run `npm run dev:clean` to clear Metro cache.
  - If it persists: delete `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/node_modules` and run `npm install`.
- **The simulator build is missing or stale**
  - Run `npm run ios` to reinstall the simulator app.
  - If native config changed, use `npm run ios:sim:clean`.
- **The app says “No development servers found” or tries `localhost:8081`**
  - Make sure `npm run dev` is still running on your Mac.
  - For simulator work, prefer `npm run dev:sim` so the app always talks to `localhost`.
  - In `MyGuest Dev`, tap `Enter URL manually` and paste the exact `Metro waiting on ...` URL from the terminal.
  - If LAN is blocked or unstable, switch to `npm run dev:tunnel`.
- **The QR code does nothing useful on iPhone**
  - That is usually a sign the dev build is not installed yet or iOS did not hand off the custom dev-client link.
  - Install the local app first with `npm run ios:device:clean`, then open `MyGuest Dev` directly.
  - Treat the QR code as a fallback, not the primary same-Wi-Fi path.
- **Tunnel startup fails or mentions ngrok**
  - Prefer `npm run dev` first. It avoids ngrok entirely.
  - Only use `npm run dev:tunnel` when you need it.
  - If tunnel still fails, check [ngrok status](https://status.ngrok.com/).
- **The dev app still shows old names or old schemes**
  - Run `npm run ios:sim:clean` for the simulator or `npm run ios:device:clean` for the phone.
- **Watchman prints a recrawl warning**
  - Run:
    ```bash
    watchman watch-del '/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front'
    watchman watch-project '/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front'
    ```

## Other Commands

- `npm run ios` runs the iOS Simulator build.
- `npm run ios:device` refreshes or reinstalls the local iPhone development build.
- `npm run ios:device:clean` regenerates the local iPhone dev project and is the safest first-run phone install path.
- `npm run ios:rebuild` remains an alias for `npm run ios:device`.
- `npm run eas:build:ios:preview` creates an installable iPhone preview build that works away from your Mac.
- `npm run eas:update:preview:ios -- --message "..."` pushes a JS-only update to the installed iPhone preview build.
- `npm run eas:update:preview -- --message "..."` remains available for broader preview-channel publishes if we later want that behavior across multiple preview targets.
- `npm run eas:build:ios:production` creates the production/TestFlight build lane.
- `npm run android` runs the Android native build.
- `npm run web` starts the web target locally.
- `npm run build:web` exports the web build to `dist/`.
- `npm test` runs the full Playwright suite.
- `npm run audit:ui` runs the UI consistency audit.

## Project Map

- `app/` - routes and route-level UI
- `docs/README.md` - index of tracked frontend operating docs
- `docs/archive/` - completed or historical notes that are no longer live guidance
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
