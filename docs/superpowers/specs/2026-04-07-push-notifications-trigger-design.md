# Push Notifications via Database Trigger

**Date:** 2026-04-07
**Status:** Approved

## Problem

Push notifications are broken in multiple ways:

1. `stripe-webhook` inserts `notification_type` values in English (`route_purchased`, `order_paid`, etc.) but the DB CHECK constraint only accepts Spanish values (`ruta_comprada`, `pago_recibido`, etc.) — inserts fail silently
2. No component actually sends push notifications to devices — `send-push-notification` edge function exists but nothing calls it
3. Only Android is supported (no Apple Developer account for APNs)

## Solution

A PostgreSQL trigger on `notifications` table that automatically sends a push notification via the Expo Push API whenever a row is inserted. This decouples push delivery from the event source — any INSERT into `notifications` triggers a push.

## Architecture

```
Event (payment, order, etc.)
  -> stripe-webhook / edge function
    -> INSERT INTO notifications (Spanish types matching CHECK constraint)
      -> AFTER INSERT trigger: notify_push_on_insert()
        -> pg_net.http_post -> send-push-notification edge function
          -> Reads push_token from the inserted data context
            -> Expo Push API -> Android device
```

## Components

### 1. Enable `pg_net` extension

Required for making HTTP requests from PL/pgSQL. Enabled via `CREATE EXTENSION IF NOT EXISTS pg_net`.

### 2. PL/pgSQL trigger function: `notify_push_on_insert`

Executes `AFTER INSERT ON notifications`. Steps:

1. Query `profiles` for the `push_token` of `NEW.user_id`
2. If no token exists, return early (user hasn't registered a device)
3. Build a JSON payload with `push_token`, `title`, `body`, and `data` (containing `route_id`, `order_id`, `business_id` from the inserted row for tap navigation)
4. Call `pg_net.http_post` to invoke `send-push-notification` edge function at `{SUPABASE_URL}/functions/v1/send-push-notification` with the service role key in the `Authorization` header
5. `pg_net` is async — does not block the INSERT transaction

### 3. Simplify `send-push-notification` edge function

Current behavior: receives `user_id`, looks up `push_token` in `profiles`, sends push, AND inserts into `notifications`.

New behavior: receives `push_token` + `title` + `body` + `data` directly, sends to Expo Push API. Does NOT insert into `notifications` (the caller already did that). Does NOT look up the token (the trigger already did that).

This makes the function a thin relay to the Expo Push API.

### 4. Fix `stripe-webhook` notification types

Replace English types with Spanish types matching the DB CHECK constraint:

| Current (fails CHECK) | Corrected |
|---|---|
| `route_purchased` | `ruta_comprada` |
| `route_sold` | `ruta_vendida` |
| `order_paid` | `pago_recibido` |
| `payment_failed` | `sistema` |
| `refund_completed` | `sistema` |

`payment_failed` and `refund_completed` don't have dedicated types in the DB constraint, so they use `sistema`.

## Limitations

- **Android only** — no Apple Developer account means no APNs. Code supports both platforms but iOS won't receive pushes until configured.
- **No retry** — if the push fails (expired token, Expo down), it is not retried. The in-app notification is already saved regardless.
- **One token per user** — `profiles.push_token` stores a single token. If a user has multiple devices, only the last registered one receives pushes.
- **Best-effort delivery** — `pg_net` is fire-and-forget. Push failures don't affect the notification insert.

## Files Changed

| File | Change |
|---|---|
| Supabase migration | Enable `pg_net`, create `notify_push_on_insert()` function and trigger |
| `supabase/functions/send-push-notification/index.ts` | Simplify to receive token directly, remove DB insert and token lookup |
| `supabase/functions/stripe-webhook/index.ts` | Fix `notification_type` values to Spanish |
