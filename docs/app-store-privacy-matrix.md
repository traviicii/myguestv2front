# App Store Privacy Matrix

Last updated: 2026-03-24

This document maps the current MyGuest codebase to the App Store privacy and
App Review questions we are likely to answer in App Store Connect. It is a
working engineering reference, not legal advice. Re-check the current Apple
forms before submission.

## Current Product Read

Based on the current frontend codebase, MyGuest appears to collect or process:

- Account identity through Firebase-backed sign-in
- Client contact details entered by the stylist
- Appointment notes and service history
- Color-chart / formula records
- Optional appointment photos
- Exported CSV data bundles
- Account deletion requests

Based on the current repo scan, there is no obvious third-party analytics SDK,
ad SDK, or tracking SDK integrated in the app bundle today. That is an
engineering inference from the checked-in code and dependencies, and should be
re-verified before release.

## Apple Guidance To Reconcile

- Apple requires a privacy policy URL in App Store Connect for iOS apps and
  requires developers to explain data handling practices in App Store Connect.
  Source: [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- Apple says the answers must reflect the most comprehensive data practices
  across the app, including third-party partner code. Source: [Manage app privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy)
- Apple requires a privacy policy link inside the app in an easily accessible
  manner. Source: [App Review Guidelines 5.1.1(i)](https://developer.apple.com/app-store/review/guidelines/)
- Apple requires a login app to provide review access, an active demo account or
  equivalent access path, and live backend services during review. Source: [App Review Guidelines - Before You Submit](https://developer.apple.com/app-store/review/guidelines/), [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)
- Apple requires apps using third-party or social login for the primary account
  to offer an equivalent login option that protects email privacy and limits
  data collection. Source: [App Review Guidelines 4.8](https://developer.apple.com/app-store/review/guidelines/)

## Working Matrix

| Product area | Current code evidence | Likely App Store privacy category to review | Linked to user? | Tracking? | Current recommendation |
|---|---|---|---|---|---|
| Sign-in identity | Firebase auth + Apple/Google sign-in in `components/auth/` | Contact Info (`Email Address`) and possibly Identifiers if a persistent app account identifier is disclosed in the form | Yes | No evidence | Confirm the exact data surfaced to Firebase/backend and answer conservatively |
| Stylist profile | Zustand profile + account settings in `components/state/` and profile screens | Contact Info | Yes | No evidence | Include if profile name, email, or phone is stored server-side |
| Client records | Client create/edit/detail flows | Contact Info | Yes | No evidence | Treat client names, phone numbers, and email addresses as collected user-linked data |
| Appointment notes and service history | Appointment create/edit/detail flows | User Content | Yes | No evidence | Include appointment notes, service history, and color-formula notes as user-created content |
| Color chart / formulas | `components/colorChart/` and formula APIs | User Content | Yes | No evidence | Include as business/client records created by the user |
| Appointment photos | `expo-image-picker`, photo permissions, appointment image flows | Photos | Yes | No evidence | Declare optional photo collection if photos are uploaded or stored remotely |
| Export My Data | `/exports/data` flow + ZIP share/download | Not a separate privacy category by itself | N/A | No | Mention in privacy policy and review notes as a user-control feature |
| Delete Account | In-app delete flow | Not a separate privacy category by itself | N/A | No | Mention in review notes and verify it works end-to-end |
| Analytics / tracking | No obvious analytics SDK in repo scan | Usage Data / Diagnostics / Tracking | Unknown | No repo evidence | If no analytics is added before launch, answer `not tracking` and do not declare analytics data types |

## Practical Submission Notes

- If we ship with Firebase auth only and no analytics, the App Privacy form
  likely centers on:
  - Email / account identity
  - Client contact info
  - User-created notes, formulas, and appointment history
  - Optional photos
- We should not declare tracking unless a real tracking use case or SDK is added.
- We should not declare analytics data casually. Confirm what is truly collected
  in production first.
- The app now has in-app privacy and support surfaces, but App Store Connect
  still needs real public URLs.

## Questions To Resolve Before Submission

- Does the backend store a persistent account identifier beyond email that must
  be declared under `Identifiers`?
- Are appointment images uploaded and retained server-side for all environments,
  or only in some builds?
- Is any crash reporting, performance monitoring, or analytics package added at
  release time outside the current repo?
- Will marketing or support pages introduce additional web analytics that need
  to be disclosed separately from the app?

## Related Files

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app.config.base.js`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app.config.js`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/auth/`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/privacy/`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/account-delete.tsx`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-launch-readiness.md`
