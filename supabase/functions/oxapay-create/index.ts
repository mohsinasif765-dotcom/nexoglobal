import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS Handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("OxApay-Create: Incoming Request:", JSON.stringify(body, null, 2));

    const { userId, amount, tier } = body;

    const merchantKey = Deno.env.get("OXAPAY_MERCHANT_KEY");
    if (!merchantKey) {
        console.error("OxApay-Create: CRITICAL ERROR - Merchant API Key NOT SET.");
        return new Response(JSON.stringify({ error: "Configuration Error" }), { status: 500, headers: corsHeaders });
    }

    const siteUrl = (Deno.env.get("SITE_URL") || "http://localhost:3000").replace(/\/$/, "");
    const orderId = `DREAM-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const payload = {
      merchant: merchantKey,
      amount: Number(amount),
      currency: "USDT",
      network: "BEP20",
      orderId: orderId,
      callbackUrl: `${siteUrl}/functions/v1/oxapay-webhook`,
      returnUrl: `${siteUrl}/wallet`,
      description: `MLM Wallet Deposit (User: ${userId?.substring(0, 8) || 'N/A'})`
    };

    console.log(`OxApay-Create: Making request for Order ${orderId} to OxApay...`);

    // Using the correct "Merchant API" endpoint
    const response = await fetch("https://api.oxapay.com/merchants/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // CRITICAL: Handle non-JSON responses (HTML error pages)
    const responseText = await response.text();
    console.log(`OxApay-Create: Raw Response (${response.status} ${response.statusText}):`, responseText);

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error("OxApay-Create: CRITICAL ERROR - Response is NOT valid JSON. (Likely an HTML error page from OxApay server)");
        throw new Error(`Invalid response from gateway (Status ${response.status}). Please try again later.`);
    }

    if (data.result !== 100 || !data.payLink) {
      console.error("OxApay-Create: API Error Response (result is not 100 or payLink missing):", data.message || "Unknown error");
      throw new Error(data.message || "OxApay Merchant Error");
    }

    console.log("OxApay-Create: SUCCESS! Generated Pay Link:", data.payLink);

    return new Response(
      JSON.stringify({
        payUrl: data.payLink, // Mapping payLink to payUrl for the frontend
        address: data.address,
        orderId: orderId,
        trackId: data.trackId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("OxApay-Create: FAILED:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Please verify your Merchant API Key and Gateway settings." 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
