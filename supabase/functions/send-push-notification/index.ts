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
