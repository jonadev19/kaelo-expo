import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function to send push notifications via Expo Push API.
 *
 * Body:
 * - user_id: string — Target user
 * - title: string — Notification title
 * - body: string — Notification body
 * - data?: object — Extra data payload
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing server config" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { user_id, title, body, data } = await req.json();

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({
          error: "user_id, title, and body are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 1. Get user's push token from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", user_id)
      .single();

    const pushToken = (profile as any)?.push_token;

    if (!pushToken) {
      console.log(`No push token found for user ${user_id}`);
      return new Response(
        JSON.stringify({
          sent: false,
          reason: "No push token registered",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Send via Expo Push API
    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
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

    // 3. Also save as in-app notification
    await supabase.from("notifications").insert({
      user_id,
      notification_type: data?.notification_type ?? "general",
      title,
      body,
      data: data ?? null,
      related_order_id: data?.order_id ?? null,
      related_route_id: data?.route_id ?? null,
      related_business_id: data?.business_id ?? null,
    });

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
