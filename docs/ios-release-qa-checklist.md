# iOS Release QA Checklist

Last updated: 2026-03-24

This is the tracked manual QA pass for MyGuest iPhone release candidates. It is
intended for a physical iPhone build, not Expo Go.

## Auth And Access

- [ ] Launch the release build from a clean install
- [ ] Before signing in, open Privacy Policy from the auth screen
- [ ] Before signing in, open Support from the auth screen
- [ ] Verify Sign in with Apple works from the first screen
- [ ] Verify Google sign-in works from the first screen
- [ ] Verify no Expo Go or developer-only messaging appears in the auth flow
- [ ] Verify failed sign-in states still expose a usable support path

## Onboarding

- [ ] Complete onboarding with default services only
- [ ] Add a new service preset during onboarding and finish successfully
- [ ] Add the first client and verify the app lands on Overview
- [ ] Confirm onboarding copy explains data ownership in a non-technical way

## Overview And Navigation

- [ ] Quick Log opens from Overview
- [ ] Client search is reachable quickly from the main experience
- [ ] Recent clients and recent appointments load without layout issues
- [ ] Data & Privacy is reachable from Profile

## Data & Privacy

- [ ] Open Data & Privacy Center
- [ ] Open in-app Privacy Policy
- [ ] Open in-app Support Center
- [ ] If hosted URLs are configured, verify hosted Privacy Policy and Support open correctly
- [ ] Export My Data succeeds and shares/downloads the ZIP bundle
- [ ] Delete Account route is reachable and explains the consequences clearly
- [ ] Logged-out Support screen does not expose broken account-only actions

## Photos And Permissions

- [ ] Deny camera permission and confirm appointment logging still works
- [ ] Deny photo-library permission and confirm appointment logging still works
- [ ] Allow permissions and verify photo attachment works
- [ ] Confirm the permission copy matches the actual app behavior

## Core Product Flows

- [ ] Create a client
- [ ] Edit a client
- [ ] Create an appointment log
- [ ] Edit an appointment log
- [ ] Verify color-chart data is viewable and editable
- [ ] Verify client contact actions behave correctly

## Review Safety Pass

- [ ] Confirm screenshots match the current UI exactly
- [ ] Confirm no unshipped features are mentioned in-app
- [ ] Confirm no dead buttons remain for support or privacy
- [ ] Confirm the backend is live and reachable for review
- [ ] Confirm release version/build labels match the uploaded archive

## Release Evidence To Capture

- [ ] Screen recording of auth success
- [ ] Screenshot of Data & Privacy Center
- [ ] Screenshot of Export My Data success
- [ ] Screenshot of Delete Account confirmation screen
- [ ] Screenshot of denied photo permission fallback
