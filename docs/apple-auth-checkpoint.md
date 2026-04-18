# Apple Auth Checkpoint

Last updated: 2026-04-16

This is the tracked checkpoint for the current Apple sign-in state on the
frontend MVP path.

## Confirmed Working State

- The installable iPhone preview build is working against the hosted backend.
- Native `Sign in with Apple` is working in the preview app for the shipping
  bundle identifier `com.travispeck.myguest`.
- Account creation with Apple sign-in succeeded in the preview app.
- Account deletion succeeded after Apple sign-in in the preview app.
- Firebase now includes the real iOS app registration for
  `com.travispeck.myguest`.
- Firebase Apple provider is enabled with the MyGuest Services ID
  `com.travispeck.myguest.signin`.

## Important Context

- The earlier audience-mismatch error was resolved after registering the real
  iOS bundle in Firebase and aligning the Apple/Firebase setup around the
  preview build.
- Firebase's optional Apple OAuth code-flow editor may still show
  `Error updating Apple`. Do not treat that as proof that the native iPhone lane
  is broken if preview Apple sign-in is still working.
- Do not churn Apple keys during active preview validation unless the live
  iPhone Apple sign-in flow actually breaks.
- Apple account switching and `Share My Email` / `Hide My Email` re-selection
  are controlled by Apple's device-level authorization state, not by an
  in-app account chooser. Use the reset steps in
  `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/account-linking-test-matrix.md`
  when re-running first-time Apple authorization cases.

## Highest-Priority Remaining Risk

- Account linking is still high priority.
- `Hide My Email` can still split a real person into a second account if they
  later try Google sign-in or another non-relay email path.
- We should not rely on implicit email matching as a launch strategy for Apple
  relay identities.

## Next Auth Test Matrix

1. Apple sign-in with `Share My Email`
2. Apple sign-in with `Hide My Email`
3. Google-first account then attempt Apple sign-in
4. Apple-first account then attempt Google sign-in
5. Verify duplicate-account behavior, conflict copy, and recovery path

## Follow-Up Work

1. Implement explicit signed-in provider linking for Apple and Google.
2. Add clean user-facing recovery copy when a second provider collides with an
   existing account.
3. Revisit the optional Apple code-flow/key-rotation cleanup once the linking
   plan is in place and we are not destabilizing the live preview lane.

The concrete manual QA pass for those identity cases now lives in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/account-linking-test-matrix.md`.
