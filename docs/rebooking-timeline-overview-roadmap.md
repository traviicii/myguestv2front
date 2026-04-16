# Rebooking, Timeline, and Action Dashboard Snapshot

Last updated: 2026-04-15

This document started as a forward-looking roadmap. Parts of that work are now
live in the product, so this file now serves two purposes:

- record what already shipped
- define the next product slices without pretending the current app is still at
  zero

This is a planning document, not a launch checklist.

## Why These Three Areas Still Matter

These remain high-leverage product bets because they move MyGuest from
remembering what happened to helping the stylist decide what to do next.

Current strengths:

- client records
- appointment logging
- color-charting
- formulas and appointment photos
- revenue and activity metrics

Current product tension:

- the app is much better at storing history than turning that history into a
  lightweight daily work queue

## Current Shipped Baseline

The following foundations already exist in the repo today:

### Rebooking foundation is live

- Services support `default_return_weeks` in the backend model, schemas, API,
  and frontend service types.
- Client detail already shows a dedicated rebooking section with:
  - latest visit
  - suggested next visit
  - driving service
  - status treatment for on-track / due-soon / overdue states
- Overview logic already derives rebooking recommendations and surfaces
  attention cards alongside other upcoming items.

Relevant files:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/models/service.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/schemas/service.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/api/v1/endpoints/services.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/data/api/services.ts`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/utils/rebooking.ts`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/detail/ClientRebookingSection.tsx`

### Client timeline is partially live

- Client detail already renders a `Client Timeline` section.
- The current merged timeline pulls together:
  - appointment history
  - color-chart updates
- The timeline is already tested and wired into client detail.

Relevant files:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/detail/ClientTimelineSection.tsx`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/detail/timelineUtils.ts`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/tests/client-timeline-utils.test.ts`

### Overview is already moving toward action-first

- Overview metrics are live.
- The app already includes a needs-attention / upcoming surface for:
  - overdue clients
  - due-soon follow-ups
  - upcoming birthdays
- Those cards already expand into short preview lists that deep-link into the
  relevant client record.

Relevant files:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/overview/OverviewNeedsAttentionSection.tsx`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/overview/overviewModelUtils.ts`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/api/v1/endpoints/metrics.py`

## What Is Still Missing

The product direction is good, but the current implementation is still more
"helpful intelligence layered onto a record system" than a fully coherent daily
workflow.

### 1. Rebooking needs a stronger completion loop

Still missing or still thin:

- post-save appointment guidance such as `Next suggested visit`
- a visible rebooking action after a save
- a clear distinction between an inferred recommendation and an actual booked
  future appointment
- better handling for multi-service visits when several services could drive the
  cadence

### 2. Timeline still under-represents the full client story

Still missing or still thin:

- formula events in the merged timeline
- richer photo event treatment beyond the appointment card preview
- clearer comparison affordances between recent visits
- possible future state changes such as VIP/inactive tags or outreach history

### 3. Overview still reads more like insight than work queue

Still missing or still thin:

- `gone quiet` detection for valuable clients
- missing-record hygiene cards such as:
  - color clients missing a color chart
  - recent visits missing photos
- a clearer "what should I do right now?" hierarchy
- a stronger dedicated Today/Appointments surface if we decide the current tab
  structure is too passive

## Recommended Language

Keep the product language concrete:

- `Rebooking` for return timing guidance
- `Needs attention` for overview cards
- `Client actions` for lightweight next steps

Avoid vague catch-all language like `follow-up` unless the UI is explicit about
what the actual next action is.

## Recommended Next Slices

### Slice 1: Finish the rebooking loop

Scope:

- show `Next suggested visit` immediately after appointment save
- expose the recommendation more consistently in appointment detail/edit flows
- tighten multi-service cadence selection rules and document them

Why first:

- this builds directly on shipped logic
- it improves day-to-day usefulness without requiring a new screen family

### Slice 2: Make overview more decisively action-oriented

Scope:

- add `gone quiet` heuristics
- add one or two missing-record cards with strong product value
- make each card feel like a work list, not just a metric with a dropdown

Good candidates:

- `Top clients gone quiet`
- `Color clients missing a color chart`
- `Recent visits missing photos`

### Slice 3: Enrich the client timeline

Scope:

- add formula-derived events
- decide whether photo additions deserve their own timeline moment or remain
  embedded in appointment cards
- improve "open / compare / reuse" actions where they create real speed for the
  stylist

### Slice 4: Revisit tab architecture only after the above feels strong

If the product keeps trending toward daily action management, revisit the tab
language and information scent.

Current tab file:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/(tabs)/_layout.tsx`

Potential directions:

- `Today`
- `Appointments`

Do this only if the new surface is materially clearer than the current control /
overview split.

## What Not To Do Yet

- do not start with full calendar sync
- do not add AI-generated outreach before the rebooking model feels trustworthy
- do not build a generic event engine before the current merged timeline proves
  where the real value is
- do not market the app as an automated follow-up machine until the workflow is
  genuinely visible and manageable in-product

## Success Metrics

When we extend this area, measure whether it changes behavior:

- percent of active services with cadence configured
- clients with a visible rebooking recommendation
- number of overdue or due-soon clients reviewed per week
- median days between suggested return date and next logged visit
- engagement with overview attention cards
- engagement with client timeline cards

## Recommendation

The clean next order is:

1. finish the rebooking loop
2. strengthen the overview work queue
3. enrich the client timeline
4. reconsider navigation only after those three land well

That path keeps the work grounded in the product that already exists instead of
resetting the story back to an older roadmap state.
