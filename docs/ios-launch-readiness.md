# iOS Launch Readiness

Last updated: 2026-03-23

This file is the tracked release-prep guide for the frontend repo. It covers the
production settings and App Store preparation work that belong in source control.
Keep secrets, reviewer credentials, and submission-only answers in the local
`APP_STORE_SUBMISSION_CHECKLIST.local.md` file instead.

Related tracked docs:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/app-store-privacy-matrix.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-release-qa-checklist.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/public-privacy-policy-draft.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/public-support-page-draft.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/app-review-notes-template.md`

## Current Production Identity

The Expo app is currently configured for first-release production identity in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app.json`.

- App name: `MyGuest`
- Slug: `myguest`
- Scheme: `myguest`
- iOS bundle identifier: `com.travispeck.myguest`
- iOS build number: `1`
- Android package: `com.travispeck.myguest`
- Android version code: `1`

Before every App Store submission:

- Increment `expo.version` when the public app version changes.
- Increment `expo.ios.buildNumber` for every iOS upload.
- Increment `expo.android.versionCode` for every Android upload.
- Confirm icons, splash, bundle ID, and scheme still match the shipping brand.

## Required Release Environment

Release builds should not depend on placeholder configuration. At minimum, set:

```bash
EXPO_PUBLIC_API_BASE_URL=<production-api-base-url>
EXPO_PUBLIC_FIREBASE_API_KEY=<firebase-web-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<firebase-project-id>
EXPO_PUBLIC_FIREBASE_APP_ID=<firebase-web-app-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<google-ios-client-id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<google-android-client-id>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<google-web-client-id>
EXPO_PUBLIC_PRIVACY_POLICY_URL=<public-privacy-policy-url>
EXPO_PUBLIC_SUPPORT_URL=<public-support-url>
EXPO_PUBLIC_USE_MOCK_DATA=false
```

Notes:

- The app supports both Google and Apple sign-in on iPhone. Google still needs
  its Firebase and platform client IDs configured correctly.
- The in-app Data & Privacy section reads `EXPO_PUBLIC_PRIVACY_POLICY_URL` and
  `EXPO_PUBLIC_SUPPORT_URL`. Leaving them blank removes those actions from the
  user-facing settings surface, which is not acceptable for submission builds.
- The app now also includes in-app `/privacy-policy` and `/support` screens so
  the product has a first-party trust surface while hosted support pages are
  being finalized. The App Store submission still needs real public URLs.
- Privacy Policy and Support are also reachable from the pre-login auth surface,
  so App Review can access trust information before authenticating.
- `EXPO_PUBLIC_DEV_ID_TOKEN` remains a local debugging escape hatch only and
  should not be part of release configuration.

## Release-Sensitive User Flows

These flows should be manually checked on a production-style iPhone build before
submitting:

- Sign in with Apple works from the auth gate and reaches the normal onboarding
  or returning-user path.
- Google sign-in works on iPhone and web without dev-only error copy.
- Settings shows the Data & Privacy actions for:
  - Privacy Policy
  - Support
  - Export My Data
  - Delete Account
- Export My Data downloads or shares the CSV ZIP bundle successfully.
- Delete Account still explains the destructive effect clearly and completes
  against the live backend.
- Photo-library and camera denial do not break appointment logging.

## Local iOS Archive Flow

This project is currently using a local iOS release-prep path rather than EAS.

1. Set production env values in `.env` or your local build environment.
2. Run `npm install` after any native dependency change.
3. Run `npm run ios:rebuild` when native config or plugins changed.
4. Open the generated Xcode workspace:
   `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/ios/exporouterexample.xcworkspace`
5. In Xcode, confirm the Apple Team, signing profile, bundle identifier, and
   Sign in with Apple capability are all valid for the target.
6. Build and archive from Xcode using the release configuration.
7. Upload the archive to App Store Connect and record the build number in the
   local submission checklist.

If the bundle ID or native capabilities change, regenerate native projects first
instead of patching generated files by hand.

## App Review Prep

The app is login-gated, so App Review needs working access. Keep these items in
the local checklist instead of git:

- Reviewer Apple sign-in credentials or a reproducible review path
- Reviewer Google sign-in credentials if Google is offered in the build
- Support contact information for App Review follow-up
- Notes that explain any non-obvious setup or demo data
- Export compliance answers and any supporting details
- Age rating, privacy disclosure, and pricing selections used in App Store Connect

The tracked App Store marketing brief lives in:

- `/Users/travispeck/Documents/coding_projects/myguestv2/marketing-pack-myguest/01_app-store/listing-brief.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/marketing-pack-myguest/01_app-store/screenshot-storyboard.csv`

Keep those files aligned with the shipped product. Do not mention mass updates,
unshipped automation, or other aspirational features in screenshots or listing copy.

## Official Apple References

Use Apple’s current documentation as the source of truth right before submission:

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Review overview: https://developer.apple.com/app-store/review/
- App privacy in App Store Connect:
  https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- App Review information fields:
  https://developer.apple.com/help/app-store-connect/reference/app-review-information
- Export compliance for builds:
  https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-export-compliance-information-for-beta-builds/

If Apple updates any of those requirements, update this document in the same
change set as the related product or release-flow changes.
