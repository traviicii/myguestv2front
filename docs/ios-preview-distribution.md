# iOS Preview Distribution

Use this workflow when you want MyGuest installed on your iPhone and usable while
your Mac is asleep, offline, or nowhere nearby.

## When To Use Which Lane

- Local simulator/device development:
  - `npm run ios`
  - `npm run dev:sim`
  - `npm run ios:device`
  - `npm run dev`
- Preview build for real-world testing away from your Mac:
  - `npm run eas:build:ios:preview`
- Production/TestFlight build:
  - `npm run eas:build:ios:production`

## What Preview Builds Solve

Preview builds are standalone internal-distribution iPhone builds:

- They launch without Metro.
- They keep working when your Mac is off.
- They are ideal for dogfooding, travel, and sharing with a small tester group.

They are not the best fit for minute-to-minute coding iteration. Keep using the
local simulator and dev-client paths for that.

## Prerequisites

- An Expo account
- A paid Apple Developer account for iOS internal distribution or TestFlight
- A registered iPhone device UDID for ad hoc preview installs
- A hosted backend if `EXPO_PUBLIC_USE_MOCK_DATA=false`

Developer Mode is also required on iOS 16+ for internal-distribution builds.

## First-Time Setup

1. Log in to Expo:

   ```bash
   npm run eas:login
   npm run eas:whoami
   ```

2. If this repo has never been linked to EAS from this machine, run:

   ```bash
   npm run eas:build:configure
   ```

3. Make sure your public runtime env values are ready for a standalone build.
   At minimum, preview builds that should work away from your Mac cannot use:

   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
   ```

   Use a reachable hosted API instead, or set `EXPO_PUBLIC_USE_MOCK_DATA=true`
   for an offline-ish preview experience.

4. Optional but recommended for OTA updates later:

   - After the EAS project is initialized, copy its project ID into `.env` as
     `EXPO_EAS_PROJECT_ID=...`
   - The dynamic app config will then embed the EAS Update URL for future builds.

## Build A Preview iPhone App

1. Register your test iPhone if it is not already on the ad hoc profile:

   ```bash
   npm run eas:device:create
   ```

2. Start the preview build:

   ```bash
   npm run eas:build:ios:preview
   ```

3. Install it from the EAS build page or with Expo Orbit.

4. Open the app on your iPhone. No development server is required.

## Ship JS-Only Preview Fixes

Once `EXPO_EAS_PROJECT_ID` is configured and a preview build is installed, you
can push non-native fixes without rebuilding the app:

```bash
npm run eas:update:preview -- --message "Fix onboarding copy and export button state"
```

Use this for JavaScript, styling, and image changes only. Native dependency,
entitlement, permission, or config changes still require a new build.

## Production / TestFlight

Use the production lane when you want a release-style binary for TestFlight or
App Store submission:

```bash
npm run eas:build:ios:production
```

This repo also keeps the local Xcode archive path documented in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-launch-readiness.md`
for cases where you want manual Xcode control.

## Current Repo Tradeoff

Preview and production builds currently reuse the same iOS bundle identifier:

- `com.travispeck.myguest`

That keeps Apple Sign In and Google auth setup simpler today, but it also means:

- Installing a preview build replaces any existing MyGuest install on that phone.
- You cannot keep App Store/TestFlight and preview builds side by side yet.

If side-by-side installs become important, the next step is separate bundle
identifiers plus matching Apple/Firebase auth credentials for each variant.
