# Push Notifications via Database Trigger — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically send push notifications to Android devices whenever a notification row is inserted, using a PostgreSQL trigger + Expo Push API.

**Architecture:** A PL/pgSQL trigger on `notifications` fires after each INSERT, reads the user's `push_token` from `profiles`, and calls the `send-push-notification` edge function via `pg_net.http_post`. The edge function is simplified to a thin Expo Push API relay. The `stripe-webhook` is fixed to insert valid Spanish `notification_type` values.

**Tech Stack:** PostgreSQL (`pg_net` extension), Supabase Edge Functions (Deno), Expo Push API

---

### Task 1: Fix stripe-webhook notification types

**Files:**
- Modify: `supabase/functions/stripe-webhook/index.ts` (lines 144, 154, 177, 200, 213, 282)

The `stripe-webhook` inserts `notification_type` values in English that fail the DB CHECK constraint. All 6 occurrences must be changed to valid Spanish values.

- [ ] **Step 1: Fix `handlePaymentSucceeded` — route purchase buyer notification (line 144)**

Change:
```typescript
      notification_type: "route_purchased",
```
To:
```typescript
      notification_type: "ruta_comprada",
```

- [ ] **Step 2: Fix `handlePaymentSucceeded` — route sale creator notification (line 154)**

Change:
```typescript
      notification_type: "route_sold",
```
To:
```typescript
      notification_type: "ruta_vendida",
```

- [ ] **Step 3: Fix `handlePaymentSucceeded` — order payment notification (line 177)**

Change:
```typescript
      notification_type: "order_paid",
```
To:
```typescript
      notification_type: "pago_recibido",
```

- [ ] **Step 4: Fix `handlePaymentFailed` — route purchase failure (line 200)**

Change:
```typescript
      notification_type: "payment_failed",
```
To:
```typescript
      notification_type: "sistema",
```

- [ ] **Step 5: Fix `handlePaymentFailed` — order payment failure (line 213)**

Change:
```typescript
      notification_type: "payment_failed",
```
To:
```typescript
      notification_type: "sistema",
```

- [ ] **Step 6: Fix `handleRefund` — refund notification (line 282)**

Change:
```typescript
      notification_type: "refund_completed",
```
To:
```typescript
      notification_type: "sistema",
```

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/stripe-webhook/index.ts
git commit -m "fix(notifications): use Spanish notification_type values matching DB CHECK constraint"
```

---

### Task 2: Simplify send-push-notification edge function

**Files:**
- Modify: `supabase/functions/send-push-notification/index.ts`

Rewrite the edge function to be a thin relay. It receives `push_token`, `title`, `body`, and `data` directly — no DB lookups, no notification insert.

- [ ] **Step 1: Rewrite the edge function**

Replace the entire contents of `supabase/functions/send-push-notification/index.ts` with:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Thin relay to Expo Push API.
 *
 * Body:
 * - push_token: string — Expo push token (e.g. ExponentPushToken[xxx])
 * - title: string — Notification title
 * - body: string — Notification body
 * - data?: object — Extra data payload (route_id, order_id, business_id for tap navigation)
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { push_token, title, body, data } = await req.json();

    if (!push_token || !title || !body) {
      return new Response(
        JSON.stringify({ error: "push_token, title, and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: push_token,
        title,
        body,
        data: data ?? {},
        sound: "default",
        badge: 1,
        channelId: "default",
      }),
    });

    const pushResult = await pushResponse.json();
    console.log("Expo Push result:", JSON.stringify(pushResult));

    return new Response(JSON.stringify({ sent: true, result: pushResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send push error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/send-push-notification/index.ts
git commit -m "refactor(notifications): simplify send-push-notification to thin Expo Push API relay"
```

---

### Task 3: Create database migration — pg_net + trigger

**Files:**
- Create: Supabase migration (via `mcp__supabase__apply_migration`)

This migration does three things: enables `pg_net`, creates the trigger function, and attaches it to the `notifications` table.

- [ ] **Step 1: Apply migration to enable pg_net and create the trigger**

Use the Supabase MCP tool `apply_migration` with project_id `xxfpttxkqzjuuoejxznt`:

Migration name: `add_push_notification_trigger`

SQL:
```sql
-- 1. Enable pg_net for async HTTP requests from PL/pgSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION public.notify_push_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_push_token text;
  v_payload jsonb;
  v_supabase_url text;
  v_service_role_key text;
BEGIN
  -- Look up the user's push token
  SELECT push_token INTO v_push_token
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- No token registered — skip silently
  IF v_push_token IS NULL OR v_push_token = '' THEN
    RETURN NEW;
  END IF;

  -- Read Supabase config from vault or use current_setting
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Fallback: use env vars set by Supabase platform
  IF v_supabase_url IS NULL OR v_supabase_url = '' THEN
    SELECT decrypted_secret INTO v_supabase_url
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_url'
    LIMIT 1;
  END IF;

  IF v_service_role_key IS NULL OR v_service_role_key = '' THEN
    SELECT decrypted_secret INTO v_service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;
  END IF;

  -- If we still don't have the URL, we can't call the function
  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE WARNING 'notify_push_on_insert: missing supabase_url or service_role_key';
    RETURN NEW;
  END IF;

  -- Build payload matching the simplified edge function interface
  v_payload := jsonb_build_object(
    'push_token', v_push_token,
    'title', NEW.title,
    'body', NEW.body,
    'data', jsonb_build_object(
      'notification_type', NEW.notification_type,
      'route_id', NEW.related_route_id,
      'order_id', NEW.related_order_id,
      'business_id', NEW.related_business_id
    )
  );

  -- Fire-and-forget HTTP POST to the edge function
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := v_payload
  );

  RETURN NEW;
END;
$$;

-- 3. Attach trigger to notifications table
DROP TRIGGER IF EXISTS trg_notify_push_on_insert ON public.notifications;
CREATE TRIGGER trg_notify_push_on_insert
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_push_on_insert();
```

**Note:** The trigger function uses `vault.decrypted_secrets` to read the Supabase URL and service role key. These secrets must be stored in the Supabase Vault (see Task 4).

- [ ] **Step 2: Commit migration file if created locally**

If using the MCP tool, the migration is applied directly. No local commit needed for the SQL.

---

### Task 4: Store secrets in Supabase Vault

The trigger function needs `supabase_url` and `service_role_key` to call the edge function. These must be stored in the Supabase Vault so the PL/pgSQL function can read them.

- [ ] **Step 1: Store the Supabase URL in vault**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT vault.create_secret(
  'https://xxfpttxkqzjuuoejxznt.supabase.co',
  'supabase_url',
  'Supabase project URL for edge function calls from triggers'
);
```

- [ ] **Step 2: Store the service role key in vault**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT vault.create_secret(
  '<SERVICE_ROLE_KEY>',
  'service_role_key',
  'Service role key for authenticated edge function calls from triggers'
);
```

**Note:** The service role key must be obtained from the Supabase dashboard (Settings > API > service_role key). Ask the user for this value — never hardcode or guess it.

---

### Task 5: Deploy the updated edge function

- [ ] **Step 1: Deploy send-push-notification**

Run:
```bash
supabase functions deploy send-push-notification --project-ref xxfpttxkqzjuuoejxznt
```

Expected: Function deployed successfully.

- [ ] **Step 2: Deploy stripe-webhook**

Run:
```bash
supabase functions deploy stripe-webhook --project-ref xxfpttxkqzjuuoejxznt
```

Expected: Function deployed successfully.

---

### Task 6: End-to-end verification

- [ ] **Step 1: Verify the trigger exists**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'trg_notify_push_on_insert';
```

Expected: One row with `tgname = 'trg_notify_push_on_insert'`, `tgenabled = 'O'` (origin).

- [ ] **Step 2: Verify pg_net is enabled**

Run via `mcp__supabase__execute_sql`:
```sql
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_net';
```

Expected: One row with `extname = 'pg_net'`.

- [ ] **Step 3: Test with a manual notification insert**

Run via `mcp__supabase__execute_sql` (use a real user_id that has a push_token registered):
```sql
INSERT INTO public.notifications (user_id, title, body, notification_type)
VALUES ('<test_user_id>', 'Test Push', 'Si recibes esto, funciona!', 'sistema');
```

Check the edge function logs in the Supabase dashboard to confirm the push was attempted.

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "feat(notifications): add database trigger for automatic push notifications"
```
