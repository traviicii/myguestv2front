# Frontend Wave 1 TODO

Last updated: 2026-03-13

This file tracks the final Wave 1 frontend polish backlog.

Current status:
- Frontend Wave 1 is complete.
- Typecheck, lint, and smoke coverage are green.
- Remaining cleanup should now happen opportunistically during normal feature work, not as a dedicated rescue/polish stream.

## Completed

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/sections.tsx`
  Broke the list header, filter controls, empty state, and row rendering into focused client-list modules under `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/list/`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/overview/useOverviewScreenModel.ts`
  Split overview refresh and derived content logic into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/overview/useOverviewRefresh.ts` and `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/overview/useOverviewContentData.ts`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/new/useNewAppointmentScreenModel.ts`
  Moved interactive picker state into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/shared/useAppointmentInteractiveUi.ts` and shared image intake into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/shared/appointmentImagePicker.ts`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/ui/surfaces.tsx`
  Extracted surface token resolution helpers into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/ui/surfaceUtils.ts`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/ui/buttons.tsx`
  Extracted shared button label/glass-layer logic into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/ui/buttonShared.tsx`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/app/_layout.tsx`
  Split font loading, provider composition, navigation theme wiring, and stack screen declarations into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/navigation/`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/auth/AuthGate.tsx`
  Split auth config and screen states into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/auth/authGateConfig.ts` and `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/auth/AuthGateViews.tsx`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/quick-log/useQuickLogScreenModel.ts`
  Pulled date, message, filtering, and service-default helpers into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/quick-log/modelUtils.ts`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/settings/AppointmentLogsSettingsSection.tsx`
  Split active/inactive/add-service blocks into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/settings/appointmentLogs/`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/NewClientForm.tsx`
  Converted the form into a thin wrapper over `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/new/useNewClientFormModel.ts` and `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/clients/new/sections.tsx`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/edit/sections.tsx`
  Reused the shared picker panel in `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/shared/AppointmentServicePickerPanel.tsx`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/onboarding/sections.tsx`
  Split onboarding step rendering into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/onboarding/steps/`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/new/sections.tsx`
  Reused the shared picker panel in `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/appointments/shared/AppointmentServicePickerPanel.tsx`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/tamagui.config.ts`
  Split theme generation into `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/theme/tamaguiThemeTypes.ts`, `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/theme/tamaguiColorUtils.ts`, and `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/theme/tamaguiThemeBuilders.ts`.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/mockData.ts`
  Confirmed it was no longer referenced and removed the leftover local artifact.

- [x] `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/data/mock/fixtures.ts`
  Split the mock fixtures into feature files under `/Users/travispeck/Documents/coding_projects/myguestv2/myguestv2front/components/data/mock/`.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test:smoke`
  Result: `63 passed`

## Working Rules

- Keep route files as shells whenever possible.
- Prefer pure helper extraction before adding more logic into screen models.
- Add or update focused helper tests when extracting non-trivial behavior.
- Keep `npm run typecheck`, `npm run lint`, and `npm run test:smoke` green after each slice.
