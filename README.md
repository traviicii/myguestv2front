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
- [Two-Terminal Rule](#two-terminal-rule)
- [Simulator Dev Loop](#simulator-dev-loop)
- [Local iPhone Dev Loop](#local-iphone-dev-loop)
- [Tunnel iPhone Dev Loop](#tunnel-iphone-dev-loop)
- [Standalone Preview Builds](#standalone-preview-builds)
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
npm run dev:sim
npm run ios:sim
npm run dev
npm run dev:tunnel
npm run ios:device
```

## iOS Development Paths

This repo supports four main iOS paths:

- **Simulator Dev Loop**: fastest day-to-day path for UI, navigation, and state
  work on this Mac.
- **Local iPhone Dev Loop**: best path for same-Wi-Fi device testing,
  gestures, camera/photo flows, haptics, and real-device feel while your Mac is nearby.
- **Tunnel iPhone Dev Loop**: fallback when LAN discovery is flaky or you are
  temporarily off the local network.
- **Standalone Preview Builds**: installable preview/TestFlight-style builds
  that do not require Metro or your Mac to stay running, but also do not give
  you the same live-update loop as a local dev client.

## Two-Terminal Rule

For the first three paths, use two terminals:

- **Terminal 1** runs Metro with `npm run dev:sim`, `npm run dev`, or
  `npm run dev:tunnel`.
- **Terminal 2** installs or refreshes the native app with `npm run ios:sim`,
  `npm run ios:device`, or the corresponding `:clean` variant.

That tandem setup matters because the native iOS scripts build with
`--no-bundler`. They expect a Metro server to already be available by the time
the dev client opens.

For physical iPhone work, this is a development-client workflow, not an Expo Go
workflow. The app you open on the phone is `MyGuest Dev`, and the QR code is a
fallback after that dev build is already installed.

If you already have MyGuest Metro running on `8081`, reuse it instead of
starting a second server. Starting another `dev:*` command while the same
project is already bound to `8081` can cause Expo to prompt for another port,
and our wrapper intentionally exits instead of guessing.

## Simulator Dev Loop

Best fit:

- fastest UI iteration
- navigation and state changes
- styling and layout work
- mock-mode product shaping

Commands:

```bash
# Terminal 1
npm run dev:sim

# Terminal 2
npm run ios:sim
```

What each command does:

- `npm run dev:sim` starts Metro on `localhost`, which is the cleanest path for
  the iOS Simulator on the same Mac.
- `npm run ios:sim` builds, installs, and opens `MyGuest Dev` in the simulator
  without starting Metro itself.

Notes:

- This is the default day-to-day development loop for frontend work.
- If `MyGuest Dev` is already installed and Metro is already running, you may
  only need to reopen the app instead of reinstalling it.
- Use `npm run ios` as a short alias for `npm run ios:sim`.
- Use `npm run ios:sim:clean` only after native dependency or app-config
  changes.
- If Watchman starts printing recrawl warnings, run `npm run dev:watchman:reset`
  once before restarting Metro.

## Local iPhone Dev Loop

Best fit:

- same-Wi-Fi iPhone testing
- camera and photo-library validation
- gesture and animation feel
- haptics and device-only polish
- auth and permission checks on a real device

Commands:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run ios:device
```

First install or native refresh:

```bash
npm run ios:device:clean
```

Release-like variant:

```bash
npm run ios:device:release-like
npm run ios:device:release-like:clean
```

What each command does:

- `npm run dev` starts Metro over LAN for a same-Wi-Fi iPhone.
- `npm run ios:device` installs or refreshes `MyGuest Dev` on the connected
  iPhone without starting Metro.
- `npm run ios:device:clean` regenerates the native project and is the safest
  first-install or post-native-change path.
- `npm run ios:device:release-like` keeps Sign in with Apple enabled so the
  local build behaves closer to preview/TestFlight auth posture.

Notes:

- This is the best path when you want live JavaScript updates while testing on a
  real iPhone.
- Keep the `npm run dev` terminal open while the app is in use.
- Make sure your Mac and iPhone are on the same Wi-Fi.
- Open `MyGuest Dev` directly on the phone after install. Do not rely on the QR
  code as the main workflow.
- If the install succeeds but iOS does not foreground the app for you, unlock
  the phone and open `MyGuest Dev` manually.
- If the app does not auto-detect Metro, tap `Enter URL manually` and use one
  of the fallback URLs that `npm run dev` now prints:
  the `Dev client` URL first, then the plain `Metro` URL if needed.
- On macOS, `npm run dev` also copies the LAN `Dev client` fallback URL to your
  clipboard automatically.
- If you need the local iPhone build to use a different Apple team than the one
  saved in the Xcode project, set `IOS_DEVELOPMENT_TEAM=<TEAM_ID>` before
  `npm run ios:device`.
- If the app cannot see your Mac, confirm `Local Network` access is enabled for
  `MyGuest Dev` in iPhone Settings and temporarily disable any VPN on the Mac or
  phone.
- If this is the first local install, trust your Apple ID profile on the phone:
  `Settings > Privacy & Security > Developer Mode`, then
  `Settings > General > VPN & Device Management`.
- `npm run ios:rebuild` remains a legacy alias for `npm run ios:device`.

## Tunnel iPhone Dev Loop

Best fit:

- off-network device testing while your Mac stays on
- flaky or blocked LAN discovery
- quick remote-ish dev-client sessions without making a standalone build

Commands:

```bash
# Terminal 1
npm run dev:tunnel

# Terminal 2
npm run ios:device
```

What each command does:

- `npm run dev:tunnel` starts Metro using Expo's tunnel host instead of LAN.
- `npm run ios:device` installs or refreshes the same `MyGuest Dev` app on the
  phone when needed.

Notes:

- You still need the local dev build installed on the phone. Tunnel mode changes
  how Metro is reached; it does not replace the dev client.
- Keep the `npm run dev:tunnel` terminal open.
- If the app does not auto-detect the server, use `Enter URL manually` with the
  Expo URL shown in the terminal.
- The QR code is optional here too; it only helps after the dev build is
  already installed.
- Tunnel mode still depends on your Mac staying awake with Metro running.

## Standalone Preview Builds

Best fit:

- dogfooding away from your laptop
- sharing builds with a small tester group
- validating a standalone binary instead of a live Metro session

Commands:

```bash
npm run eas:login
npm run eas:device:create
npm run eas:build:ios:preview
```

Optional JS-only follow-up after the preview app is installed:

```bash
npm run eas:update:preview:ios -- --message "Describe the JS-only preview fix"
```

What each command does:

- `npm run eas:login` signs this machine into Expo/EAS.
- `npm run eas:device:create` registers the iPhone for ad hoc preview installs.
- `npm run eas:build:ios:preview` creates an installable preview binary that
  works without Metro.
- `npm run eas:update:preview:ios` pushes a JS-only update to the installed
  preview build without rebuilding native code.

Notes:

- This is the right path when you want a build that works while your Mac is off
  or nowhere nearby.
- This is not the right path when you want the fastest live iteration for
  haptics, styling, or interaction tuning on your own phone. Use the Local
  iPhone Dev Loop instead.
- Preview/TestFlight builds need a hosted backend. If
  `EXPO_PUBLIC_API_BASE_URL` still points at `127.0.0.1`, the app will only
  work in mock mode away from your Mac.
- Preview builds in this repo currently reuse the production bundle identifier
  for the simplest Apple/Google auth setup, so installing one replaces any
  existing MyGuest install on that iPhone.
- Use the preview OTA script only for JavaScript, styling, copy, or image
  changes. Native dependency, entitlement, permission, app-config, or
  environment changes still require a new preview build.

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
  - If this Mac has multiple Apple Development teams available, rerun with `IOS_DEVELOPMENT_TEAM=<TEAM_ID> npm run ios:device` so the local project uses the expected team.
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
- **Expo says it cannot parse `.expo/prebuild/cached-packages.json`**
  - Re-run `npm run ios:sim` or `npm run ios:device`.
  - Our iOS launcher now deletes empty or invalid copies of that derived cache file automatically before handing off to Expo.
- **Metro prints `Must call import '@tamagui/native/setup-zeego' at your app entry point`**
  - MyGuest already imports Zeego in the app entry file.
  - If the app still bundles and opens, treat this as a noisy Tamagui menu warning, not a launch blocker.
  - Only chase it if we start shipping native Tamagui menu/context-menu components or the app actually fails to render.
- **The app says “No development servers found” or tries `localhost:8081`**
  - Make sure `npm run dev` is still running on your Mac.
  - For simulator work, prefer `npm run dev:sim` so the app always talks to `localhost`.
  - In `MyGuest Dev`, tap `Enter URL manually` and use the `Dev client` fallback URL that `npm run dev` prints. If that fails, try the plain `Metro` URL from the same output.
  - On macOS, `npm run dev` copies that LAN `Dev client` fallback URL to your clipboard automatically.
  - On iPhone, verify `Local Network` access is enabled for `MyGuest Dev` and try again with VPN disabled on both devices.
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
  - Run `npm run dev:watchman:reset`.
  - If you prefer the raw commands, the helper script runs the same two Watchman commands for this repo root.

## Other Commands

- `npm run ios` runs the iOS Simulator build.
- `npm run dev:watchman:reset` refreshes Watchman state for this repo when Metro starts printing recrawl warnings.
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
