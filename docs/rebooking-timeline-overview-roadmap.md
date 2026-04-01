# Rebooking, Timeline, and Action Dashboard Roadmap

## Why these three

These are the highest-leverage next product moves for MyGuest because they turn the app from a strong record-keeping tool into a stronger day-to-day operator tool.

Current strengths:

- client records
- appointment logging
- color charting
- photos and formulas

Current gap:

- the app remembers what happened, but it does less to help the stylist decide what to do next

This roadmap focuses on:

1. rebooking intelligence
2. a unified client timeline
3. an action-first overview/dashboard

## Language choice

The term `follow-up` may be too vague for this product.

Recommended language:

- `Rebooking reminder` for outreach tied to return timing
- `Client action` for anything the stylist should do next
- `Needs attention` for overview cards

When we say `what's slipping`, we mean:

- clients who are passing their expected return window
- high-value clients who have gone quiet
- color clients whose records are incomplete enough to weaken future service quality

## Priority 2: Rebooking Intelligence

### Product goal

Help stylists know when a client should come back, when they are overdue, and what action to take next.

### MVP behavior

Each service gets an optional default return cadence in weeks.

Examples:

- Root Touch-Up: 6 weeks
- Gloss: 8 weeks
- Highlight Refresh: 10 to 12 weeks
- Haircut: 6 to 8 weeks

From that, the app derives:

- suggested next visit date
- due this week
- overdue
- overdue by how long

### Where it should appear

#### Settings / Services

Add cadence configuration next to default pricing.

Relevant files today:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/models/service.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/schemas/service.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/api/v1/endpoints/services.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/data/api/services.ts`

Suggested new field:

- `default_return_weeks: int | null`

#### Appointment save flow

After saving an appointment, show:

- `Next suggested visit: May 14`
- `Based on Root Touch-Up cadence (6 weeks)`

Optional CTA later:

- `Mark as rebooked`
- `Remind me later`

#### Client detail

Show a dedicated rebooking section near the top:

- last visit
- primary recent service
- next suggested visit
- current status: `on track`, `due soon`, `overdue`

#### Overview

Show aggregate rebooking cards:

- due this week
- overdue now
- top clients gone quiet

### Data model and logic

Start simple and derive rather than store.

Inputs:

- latest appointment date
- service used on latest appointment
- service cadence

Derived fields:

- `suggested_next_visit_at`
- `rebooking_status`
- `days_overdue`

This does not need calendar sync to be useful.

### MVP rules

- if the latest appointment has one recognized service with cadence, use it
- if multiple services exist, use the longest cadence first for MVP or define a preferred-service rule
- if no cadence exists, show no rebooking recommendation
- if the client has no visits, show no rebooking state

### Why this is strong

This creates daily usefulness without forcing the app to become a full booking platform.

## Priority 4: Unified Client Timeline

### Product goal

Give the stylist one chronological memory stream for each client instead of splitting memory across different screens.

### Current issue

Client memory is distributed across:

- client detail
- appointment detail
- color chart
- notes
- photos

Relevant routes today:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/client/[id].tsx`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/appointment/[id].tsx`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/client/[id]/color-chart/index.tsx`

### Timeline event types

The timeline should combine:

- appointment logged
- service labels
- price
- notes
- photos added
- formula details
- color chart created or updated

Optional later:

- birthday
- rebooking reminder sent
- client tagged VIP or inactive

### Timeline card examples

#### Appointment event

- `Mar 12, 2026`
- `Partial Highlight + Gloss`
- `$185`
- `Notes: toned cooler through mids`
- photo strip
- quick actions: `Open appointment`, `Compare to previous`

#### Color chart event

- `Color chart updated`
- summary chips for major fields changed
- quick action: `Open color chart`

#### Formula event

- formula summary
- pinned photo
- quick action: `Reuse formula`

### Why this matters

For a stylist, memory is not separated by technical model type.
The valuable question is:

- `What happened with this client over time?`

### MVP approach

Do not build a brand-new backend event store first.
Instead, aggregate from existing data:

- appointments/formulas
- formula images
- color chart timestamps

Then render a merged sorted list.

This keeps scope grounded.

## Priority 6: Action-First Overview

### Product goal

Make the overview answer:

- who needs attention today
- what is falling behind
- what is helping growth

### Current opportunity

Current overview metrics are already meaningful:

- revenue YTD
- average ticket
- active clients
- service mix
- color coverage
- photo coverage

Relevant backend/frontend metrics files:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/api/v1/endpoints/metrics.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2back/app/schemas/metrics.py`
- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/data/api/metrics.ts`

What is missing is action-oriented output.

### New overview cards

Recommended first set:

- `Due to rebook this week`
- `Overdue for return`
- `Upcoming birthdays`
- `Top clients gone quiet`

Recommended second set:

- `Color clients missing a color chart`
- `Recent visits missing photos`
- `High-value clients not seen in X weeks`

### Definitions

#### Due to rebook this week

Clients whose suggested next visit date falls within the next 7 days.

#### Overdue for return

Clients whose suggested next visit date has passed.

#### Upcoming birthdays

Clients with birthdays in the next 14 days.

Note: birthdays already exist in the client model.

#### Top clients gone quiet

Clients with stronger value history who have gone beyond their usual cadence or a fallback inactivity threshold.

### Interaction model

Each card should expand into a short, actionable list:

- client name
- last visit
- recommended action
- one tap to open client

This is more useful than passive counts alone.

## Recommended build order

### Slice 1: Rebooking data foundation

- add service cadence field
- expose it in service create/update/read
- wire it through frontend service types and settings UI

### Slice 2: Rebooking logic in client and overview surfaces

- derive suggested next visit from latest appointment + cadence
- show rebooking status on client detail
- add overview cards for due this week and overdue

### Slice 3: Birthday and quiet-client cards

- add upcoming birthdays card
- add gone quiet card using simple heuristics first

### Slice 4: Unified client timeline

- aggregate appointments, photos, formulas, and color chart updates
- show merged timeline on client detail

### Slice 5: Optional navigation change

If this proves valuable, consider replacing the `Control` tab with `Appointments` or `Today`.

Current tab file:

- `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/(tabs)/_layout.tsx`

If we choose `Appointments`:

- upcoming appointments
- recent logs
- quick log CTA
- due-to-rebook list

If we choose `Today`:

- due to rebook
- overdue
- birthdays
- recent incomplete records

`Today` is the stronger product direction.

## What not to do yet

- do not start with full calendar sync
- do not add AI-generated messaging before the rebooking model is solid
- do not invent a complex follow-up system before the app proves that `client actions` are actually useful
- do not build a generic event engine before the timeline proves its value

## Success metrics

Track whether these changes actually improve behavior:

- percent of active services with cadence configured
- clients with a visible rebooking recommendation
- number of overdue clients reviewed per week
- rebook rate
- median days between suggested return date and next logged visit
- overview card open rate
- client detail timeline engagement

## Recommendation

Build these in this order:

1. rebooking intelligence
2. action-first overview cards
3. unified client timeline

That order gives the fastest product payoff with the least architecture risk.
