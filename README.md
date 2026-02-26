# MyGuest v2

Mobile-first client management app for stylists, built with Expo Router + Tamagui.

## Stack

- Expo + React Native
- Expo Router (file-based routing)
- Tamagui (design system + primitives)
- React Query (data access boundary)
- Zustand (persisted UI/preferences state)
- Playwright (web export smoke test)

## Getting Started

```bash
npm install
npm run start
```

Useful commands:

- `npm run ios` - run on iOS simulator/device
- `npm run android` - run on Android emulator/device
- `npm run web` - run web target locally
- `npm run build:web` - export static web build to `dist/`
- `npm test` - Playwright test against exported web build

## Live v2 API (Dev)

To use real data from your v2 backend instead of mock collections, create `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://myguestv2back.onrender.com/api/v1
EXPO_PUBLIC_DEV_ID_TOKEN=<firebase-id-token>
```

Notes:

- `EXPO_PUBLIC_DEV_ID_TOKEN` should be a real Firebase ID token for a valid user.
- The app will call `POST /auth/sync` automatically before protected API reads/writes.
- If token/base URL are missing, query hooks fall back to mock data.

## Project Map

- `app/` - routes and route-level UI (Expo Router)
- `components/` - shared UI, forms, providers, stores, query hooks
- `components/data/queries.ts` - central query hooks used by screens
- `components/state/` - persisted Zustand stores for UI and preferences

## Data Flow

- Screens read entities through React Query hooks (`useClients`, `useAppointmentHistory`, etc).
- Local edits currently patch React Query cache directly (optimistic/local-first behavior).
- Cross-screen UI preferences (filters, theme, dashboard layout, app settings) live in persisted Zustand stores.

## Notes

- `ios/` and `android/` are generated prebuild/run artifacts and are ignored in git here.
- `components/AmbientBackdrop.tsx` is intentionally a placeholder so background treatment can be reintroduced globally in one place.
