# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kaelo** is a mobile-first cycling route and local commerce platform for Yucatán, México. Cyclists discover and navigate routes, pre-order from local businesses along the way, and creators monetize their route knowledge. Built with React Native (Expo) + Supabase.

## Commands

```bash
# Start development server
yarn start

# Run on iOS/Android
yarn ios
yarn android

# Run tests
yarn test
yarn test:watch
yarn test:coverage

# Run a single test file
yarn test src/features/routes/__tests__/api.test.ts

# Regenerate Supabase TypeScript types
yarn gen:types
```

## Environment Variables

Required `EXPO_PUBLIC_*` vars (validated with Zod at startup in `src/config/env.ts`):
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional)

## Architecture

### Directory Structure

- `app/` — Expo Router file-based routes. `(auth)/` for unauthenticated screens, `(tabs)/` for the main tab navigator, plus modal/card screens at the root.
- `src/features/` — Feature modules (see below)
- `src/shared/` — Cross-feature: auth store, theme store, location store, settings store, shared hooks/components
- `src/lib/` — Singleton clients: `supabase.ts` (typed Supabase client) and `react-query.ts` (QueryClient)
- `src/config/` — Env config (`env.ts`) and Mapbox init (`mapbox.ts`)
- `src/types/database.types.ts` — Auto-generated from Supabase schema (run `yarn gen:types`)
- `supabase/functions/` — Edge Functions (Deno runtime): `check-email-exists`, `create-payment-intent`, `stripe-webhook`, `send-push-notification`

### Feature Module Convention

Each feature under `src/features/<name>/` follows this pattern:
```
api.ts          — raw Supabase calls (no React)
types.ts        — TypeScript interfaces
keys.ts         — TanStack Query key factories
hooks/          — useQuery / useMutation hooks wrapping api.ts
screens/        — Screen components
components/     — Feature-specific UI components
store/          — Zustand stores (if local state needed)
__tests__/      — Jest tests for api.ts and hooks
```

Features: `auth`, `businesses`, `favorites`, `metrics`, `notifications`, `offline`, `orders`, `payments`, `profile`, `reviews`, `routes`, `wallet`

### Data Flow

1. Screens call hooks (e.g. `useRouteDetail`)
2. Hooks use TanStack Query (`useQuery`/`useMutation`) with keys from `keys.ts`
3. Query functions call `api.ts` which uses the typed `supabase` client
4. Complex queries use Supabase RPCs (e.g. `get_published_routes`, `get_route_detail`) defined in migrations

### State Management

- **Server state**: TanStack Query (all Supabase data)
- **Auth state**: `src/shared/store/authStore.ts` — Zustand wrapping `supabase.auth`, initialized once in `app/_layout.tsx`
- **UI/local state**: Zustand stores per feature (cart, offline, map settings, notifications, theme, location, settings)

### Navigation & Auth Guard

`app/_layout.tsx` contains the root layout with auth redirect logic: unauthenticated users are redirected to `/(auth)/login`; authenticated users are redirected away from auth screens. Uses `useSegments` + `useRouter` from expo-router.

### Maps

Mapbox (`@rnmapbox/maps`) is initialized in `src/config/mapbox.ts`. The `src/features/routes/api/directions.ts` file calls the Mapbox Directions API directly. Route geometry uses PostGIS `GEOMETRY(LineString, 4326)` (not GEOGRAPHY) — see `docs/03-architecture.md` for the rationale.

### Payments

Stripe integration via `@stripe/stripe-react-native`. Payment intents are created in the `create-payment-intent` Edge Function. The `StripeProvider` wraps the entire app in `app/_layout.tsx`.

### Offline

The `src/features/offline/` module handles route downloading to AsyncStorage. Downloaded route data is managed via `useOfflineStore` (Zustand).

### Database

PostgreSQL + PostGIS on Supabase. All geospatial columns use SRID 4326. Key design patterns:
- Soft deletes via `status` fields (never hard DELETE)
- State machines for orders (`pendiente → confirmado → preparando → listo → entregado/cancelado`) and routes (`borrador → en_revision → publicado/rechazado/archivado`)
- Unified `reviews` table for both routes and businesses (discriminated by `review_type`)
- Pre-aggregated `user_stats_monthly` for performance

### Alias

`@/` maps to `src/` (configured in Jest `moduleNameMapper` and Expo/TypeScript paths).
