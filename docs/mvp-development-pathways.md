# MVP Development Pathways

Last updated: 2026-04-22

This is the working operating guide for how we should build, validate, and
release MyGuest as we move toward MVP launch.

Now that the paid Apple Developer account is active, we should stop treating
iPhone distribution as a special-case workaround and start using clearer lanes
with stronger separation between:

- fast coding
- real-device validation
- preview dogfooding
- TestFlight release candidates
- production release

This guide is intentionally practical. It is meant to reduce friction and keep
us from using the wrong environment for the wrong job.

Related docs:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-preview-distribution.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-launch-readiness.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-release-qa-checklist.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/app-store-privacy-matrix.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/README.md`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/scripts/smoke_render_contract.sh`

## Recommended Lanes

### 1. Fast local coding

Use this for most feature work.

Best fit:

- UI work
- navigation
- state changes
- mock-mode product shaping
- local backend iteration

Commands:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run dev:sim
npm run ios:sim
```

Prefer this lane when:

- you do not need camera/photo-library validation
- you do not need Apple Sign In validation
- you are changing screens more than infrastructure

### 2. Real-device validation

Use this once a feature is functionally ready and needs to feel trustworthy on
an actual iPhone.

Best fit:

- gestures
- scrolling
- image picking
- pull-to-refresh
- auth validation
- performance feel
- real-device visual QA

Commands:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run dev
npm run ios:device:release-like:clean
```

Why this lane matters now:

- the paid Apple Developer account means we can keep Sign in with Apple enabled
  in release-like device builds instead of optimizing for Personal Team limits
- this is now the best “does it behave like launch?” local loop

Use the lighter reinstall path after the first clean install:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run dev
npm run ios:device:release-like
```

If Metro starts printing Watchman recrawl warnings in either local lane, run:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run dev:watchman:reset
```

### 3. Preview dogfooding

Use this when the app needs to work with no laptop, no Metro, and no same-Wi-Fi
assumptions.

Best fit:

- personal dogfooding
- a few trusted testers
- travel / away-from-desk validation
- verifying backend + auth + standalone build behavior together

Commands:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run eas:build:ios:preview
```

For JS-only preview fixes:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run eas:update:preview -- --message "Describe the preview-only fix"
```

Guardrails:

- preview builds should use a hosted preview backend, not localhost
- preview should be the main lane for “works when I’m away from my Mac”
- prefer preview OTA updates only for low-risk JS-only fixes

### 4. Release candidate / TestFlight

Use this lane when we want a build that behaves like the shipping product.

Best fit:

- internal release QA
- stakeholder review
- App Review confidence pass
- final login, export, delete-account, and permission checks

Command:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
npm run eas:build:ios:production
```

Recommended policy:

- treat production/TestFlight builds as release candidates, not casual preview
  builds
- only point this lane at the production backend once the backend deployment and
  smoke checks are green
- avoid `eas update:production` unless it is a deliberate, low-risk post-launch
  JS hotfix

## Environment Matrix

| Lane | App build | Backend | Auth posture | Apple Sign In | OTA updates |
|---|---|---|---|---|---|
| Fast local coding | local dev client / simulator | local or mock | dev-only | optional | no |
| Real-device validation | local release-like dev client | local or preview | release-like | on | no |
| Preview dogfooding | EAS preview | preview | release-like | on | yes, preview only |
| Release candidate | EAS production / TestFlight | production | shipping | on | avoid except emergency |
| Production release | App Store build | production | shipping | on | extremely cautious |

## Recommended Working Agreement

### Default daily path

Use the simulator for most coding and the release-like iPhone dev build for
final confidence checks on any meaningful feature.

That means our normal loop should be:

1. build in simulator
2. verify on iPhone before we call it done
3. use preview for dogfooding
4. use production/TestFlight only when a change is candidate-quality

### Backend promotion path

Backend promotion should happen ahead of frontend preview or TestFlight usage.

Recommended order:

1. local backend verification
2. preview backend deploy
3. remote smoke contract pass
4. preview app build
5. production backend deploy
6. remote smoke contract pass again
7. TestFlight / production app build

Remote smoke command:

```bash
cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back
make smoke-remote BASE_URL=https://api.example.com/api/v1 TOKEN=$EXPO_PUBLIC_DEV_ID_TOKEN
```

### OTA update policy

Use OTA updates intentionally.

Recommended policy:

- `preview` channel: yes, for JS-only fixes
- `production` channel: only after a short written risk check

Do not use OTA when the change touches:

- native modules
- entitlements
- permissions
- app config
- auth provider setup
- environment assumptions

## What We Should Set Up Now

### Frontend / Apple / EAS

1. Run:

   ```bash
   cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
   npm run eas:login
   npm run eas:whoami
   npm run eas:build:configure
   ```

2. Store the EAS project ID in local env as `EXPO_EAS_PROJECT_ID`.
3. Register your iPhone for preview installs:

   ```bash
   cd /Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front
   npm run eas:device:create
   ```

4. Confirm App Store Connect app record, bundle identifier, and Sign in with
   Apple capability all line up with:
   - `com.travispeck.myguest`
   - `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app.config.base.js`

### Environment separation

We should operate with three backend environments:

- local
- preview
- production

And three frontend runtime intents:

- development
- preview
- production

The important rule is:

- preview app builds should not talk to localhost
- production/TestFlight builds should not talk to preview infrastructure unless
  we are intentionally using a temporary release-candidate backend

### Hosted runtime requirements

Before regular preview/TestFlight use, confirm these are real and stable:

- preview API base URL
- production API base URL
- Firebase config for shipping app identity
- public privacy policy URL
- public support URL

## MVP Release Sequence

### Before first serious preview rollout

- preview backend deployed
- remote smoke script passes
- preview frontend env values confirmed
- preview build installed on at least one real iPhone
- Apple Sign In verified in a standalone build

### Before first TestFlight build

- production backend deployed
- production backend smoke passes
- release env values confirmed
- privacy/support URLs public and correct
- App Store Connect privacy answers reviewed against
  `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/app-store-privacy-matrix.md`
- manual QA checklist run from
  `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/docs/ios-release-qa-checklist.md`

### Before App Store submission

- version/build numbers incremented
- screenshots match the real app
- App Review notes prepared
- export/delete-account flows verified on the release candidate
- reviewer access path confirmed

## Recommended Next Moves

If we want the smoothest path from here to MVP, the next practical steps are:

1. Get preview and production backend URLs fully separated and documented.
2. Produce the first preview standalone iPhone build.
3. Run the backend smoke script against the hosted preview backend.
4. Use the release-like device lane as the default final check for each feature.
5. Treat TestFlight as a release-candidate lane, not as our general dogfooding
   lane.

That gives us a workflow that is faster during development and calmer during
launch prep.
