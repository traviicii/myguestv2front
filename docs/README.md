# Frontend Docs Guide

Last updated: 2026-04-15

This directory holds the tracked operating docs for the MyGuest frontend repo.
Keep these files aligned with the current codebase, scripts, and release lanes.

## Ground Rules

- Keep secrets, reviewer credentials, and one-off submission answers in local-only
  files such as `APP_STORE_SUBMISSION_CHECKLIST.local.md`, not in git.
- Treat launch and release docs as source-of-truth references, not aspiration
  boards. If the product or build flow changes, update the docs in the same
  change set.
- Move completed or historical worklogs into `docs/archive/` so the top-level
  folder stays focused on current guidance.

## Current Operating Docs

- `mvp-development-pathways.md`
  Working guide for simulator, real-device, preview, TestFlight, and release
  lanes.
- `ios-launch-readiness.md`
  Tracked launch-prep checklist for production identity, auth posture, privacy
  links, export/delete expectations, and App Review prep.
- `ios-preview-distribution.md`
  Preview-build and EAS distribution workflow for installs that should work
  away from the laptop.
- `apple-auth-checkpoint.md`
  Current checkpoint for the working iPhone Apple sign-in path, known auth
  risks, and the next account-linking test matrix.
- `account-linking-test-matrix.md`
  Manual Apple/Google identity QA matrix, including current expected behavior
  and the MVP exit criteria for provider-linking safety.
- `ios-release-qa-checklist.md`
  Manual iPhone release-candidate QA pass.
- `app-store-privacy-matrix.md`
  Engineering reference for App Store privacy disclosures and review-access
  questions.
- `app-review-notes-template.md`
  Draft reviewer-notes template for App Store Connect.

## Public Page Drafts

- `public-privacy-policy-draft.md`
  Draft hosted privacy-policy copy for the public support site.
- `public-support-page-draft.md`
  Draft hosted support/help copy for the public support site.

## Product Planning

- `rebooking-timeline-overview-roadmap.md`
  Planning note for the rebooking, client-timeline, and action-first overview
  direction. This file now distinguishes what is already shipped from what still
  belongs to future work.

## Archive

- `archive/completed-wave-1/frontend-wave-1-todo.md`
  Historical record of the completed Wave 1 frontend cleanup. Useful for
  context, but not a live backlog.
