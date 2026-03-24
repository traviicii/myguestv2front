# App Review Notes Template

Use this draft as the basis for the `Notes for Review` field in App Store
Connect. Keep credentials and contact details in
`APP_STORE_SUBMISSION_CHECKLIST.local.md`, not in git.

## Draft

MyGuest is a client CRM for hairstylists and independent beauty professionals.
The app is account-based because client records, appointment logs, color-chart
records, and optional appointment photos are tied to the user’s account.

Review access:

- Sign in with Apple: `[REVIEWER_APPLE_ACCOUNT]`
- Google sign-in: `[REVIEWER_GOOGLE_ACCOUNT]`

Important review notes:

- The app supports both Sign in with Apple and Google sign-in in the shipping build.
- Data & Privacy is accessible inside the app from Profile.
- The app includes in-app Privacy Policy and Support screens even before hosted
  public pages are finalized.
- `Export My Data` produces a ZIP of CSV files only. Appointment images are not
  included in exports.
- `Delete Account` is available inside the app and permanently removes hosted
  account data.

Suggested test flow:

1. Sign in with Apple or Google
2. Complete onboarding
3. Open Overview
4. Open Profile → Data & Privacy
5. Verify Privacy Policy, Support, Export My Data, and Delete Account paths

Backend availability:

- The review environment and backend services will remain live during App Review.

Contact:

- Review contact name: `[REVIEW_CONTACT_NAME]`
- Review contact email: `[REVIEW_CONTACT_EMAIL]`
- Review contact phone: `[REVIEW_CONTACT_PHONE]`
