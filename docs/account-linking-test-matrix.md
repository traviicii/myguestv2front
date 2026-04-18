# Account Linking Test Matrix

Last updated: 2026-04-16

This file is the manual QA matrix for the current Apple + Google identity
behavior in MyGuest.

It is intentionally split into:

- what the system does today
- what the product should eventually do after explicit provider linking lands

## Current Backend Behavior

The current backend auth sync flow lives in
`/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/api/v1/endpoints/auth.py`.

Important rules today:

1. If the incoming Firebase `uid` already exists, MyGuest reuses that user.
2. If the incoming `uid` does not exist and the verified email matches an
   existing MyGuest user whose `firebase_uid` is still null, MyGuest links that
   legacy user to the new Firebase identity.
3. If the verified email matches an existing MyGuest user that already has a
   different `firebase_uid`, MyGuest returns a `409 auth_identity_conflict`.
4. If Apple `Hide My Email` produces a different relay address, the backend sees
   it as a different identity and can create a second account.

So today:

- matching-email cross-provider sign-in is not true provider linking
- Apple relay emails are the biggest account-splitting risk

## Test Accounts

Prepare:

1. one Google test identity you control
2. one Apple sign-in identity on the test iPhone
3. one clean preview build installed on iPhone
4. access to delete the MyGuest account between cases when needed

Notes:

- Apple may stop showing the `Share My Email` / `Hide My Email` prompt after the
  first authorization. If that happens, reset MyGuest inside Apple's
  `Apps Using Apple ID` settings before retrying a first-run Apple case.
- Use account deletion or a fresh MyGuest identity state between cases when you
  need a clean baseline.

## Resetting Apple Test State On iPhone

Use this whenever you need Apple to show the first-run consent sheet again for
MyGuest.

1. Sign out of MyGuest or delete the MyGuest account if the case requires a full
   reset.
2. On iPhone, open `Settings`.
3. Tap your Apple Account name.
4. Tap `Sign in with Apple`.
5. Select `MyGuest`.
6. Tap `Delete` to stop using Sign in with Apple for MyGuest.
7. Reopen MyGuest and start Apple sign-in again.

Expected result:

- Apple should treat MyGuest as a fresh authorization again and can show the
  `Share My Email` / `Hide My Email` choice again.

Important:

- This reset is per Apple account and app authorization state, not per MyGuest
  session.
- The app itself cannot force the system to switch Apple accounts on native iOS.
- To test a different Apple identity, use another device signed into a
  different Apple account or sign the test device into a different Apple
  account before retrying.

Related but different:

- `Settings` -> `[your name]` -> `iCloud` -> `Hide My Email` manages Apple relay
  forwarding behavior.
- That screen does not replace the app-level `Share My Email` vs `Hide My
  Email` consent reset above.

## Matrix

### Case 1: Apple first with Share My Email

Steps:

1. Start from no MyGuest account for that Apple identity.
2. Sign in with Apple.
3. Choose `Share My Email`.

Expected today:

- account is created successfully
- backend stores the real Apple email if Apple provides it
- user can reach onboarding / signed-in app

Desired future:

- same as today

### Case 2: Apple first with Hide My Email

Steps:

1. Start from no MyGuest account for that Apple identity.
2. Sign in with Apple.
3. Choose `Hide My Email`.

Expected today:

- account is created successfully
- backend stores the Apple relay email
- this identity is now separate from any Google account that uses the person's
  real email

Desired future:

- app warns clearly about cross-provider account linking risk or supports
  explicit linking before a second provider is added

### Case 3: Google first, then Apple with the same real email

Steps:

1. Create a MyGuest account with Google.
2. Sign out.
3. Attempt Apple sign-in using the same real email via `Share My Email`.

Expected today:

- if Firebase treats Apple as a different `uid`, backend should hit
  `409 auth_identity_conflict`
- the user should not silently merge into the Google-backed account
- frontend currently needs better user-facing recovery copy here

Desired future:

- signed-in account can explicitly link Apple
- future Apple sign-in returns the same MyGuest account without conflict

### Case 4: Google first, then Apple with Hide My Email

Steps:

1. Create a MyGuest account with Google.
2. Sign out.
3. Attempt Apple sign-in with `Hide My Email`.

Expected today:

- likely creates a second MyGuest account because the relay email differs
- no automatic merge should occur

Desired future:

- app guides the user into explicit linking before a second account is created

### Case 5: Apple first, then Google with the same real email

Steps:

1. Create a MyGuest account with Apple using `Share My Email`.
2. Sign out.
3. Attempt Google sign-in with the same real email.

Expected today:

- likely `409 auth_identity_conflict` because the MyGuest user already has a
  different `firebase_uid`

Desired future:

- signed-in Apple account can explicitly link Google

### Case 6: Apple first with Hide My Email, then Google

Steps:

1. Create a MyGuest account with Apple using `Hide My Email`.
2. Sign out.
3. Attempt Google sign-in with the user's real email.

Expected today:

- likely creates a second MyGuest account
- this is the clearest duplicate-account failure mode in the current product

Desired future:

- app prevents silent duplication with linking or conflict-recovery UX

## What To Record During Testing

For each case, capture:

1. provider used first
2. whether Apple used `Share My Email` or `Hide My Email`
3. whether sign-in succeeded, failed, or created a duplicate account
4. exact user-facing error copy if a conflict happens
5. whether the backend created a new MyGuest user or reused the existing one

## Exit Criteria For MVP

Minimum acceptable before broad rollout:

1. conflict paths are understandable to a real user
2. duplicate-account creation is either prevented or clearly recoverable
3. Apple relay email behavior is explicitly handled in product logic

Preferred:

1. explicit signed-in `Link Apple` / `Link Google` flow
2. provider-management UI in settings
3. support-safe recovery path for already-split accounts
