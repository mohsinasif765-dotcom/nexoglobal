import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const data = await req.json();
    console.log("OxApay Webhook: FULL PAYLOAD RECEIVED:", JSON.stringify(data, null, 2));

    const { status, orderId, txID, amount, currency } = data;

    if (status !== "paid" && status !== "success") {
      console.log(`OxApay Webhook: IGNORED status: '${status}' for Order: ${orderId}`);
      return new Response(JSON.stringify({ status: "ignored", message: `Status is ${status}` }), { status: 200 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
        console.error("OxApay Webhook: CRITICAL ERROR - Supabase URL or Service Role Key NOT SET in environment.");
        return new Response("Server configuration error", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`OxApay Webhook: Processing Payment for Order: ${orderId}, Hash: ${txID}, Amount: ${amount} ${currency}`);

    // Update Request
    const { data: request, error: fetchError } = await supabase
      .from("pin_requests")
      .select("*")
      .eq("trx_id", orderId)
      .single();

    if (fetchError || !request) {
      console.error(`OxApay Webhook: ORDER NOT FOUND IN DATABASE. OrderId: ${orderId}. Error:`, fetchError?.message);
      return new Response("Order not found", { status: 404 });
    }

    if (request.status === "approved") {
      console.log(`OxApay Webhook: Order: ${orderId} already APPROVED. Skipping.`);
      return new Response("Already processed", { status: 200 });
    }

    const { error: updateError } = await supabase
      .from("pin_requests")
      .update({ 
        status: "approved", 
        tx_hash: txID,
        updated_at: new Date().toISOString()
      })
      .eq("id", request.id);

    if (updateError) {
        console.error(`OxApay Webhook: DATABASE UPDATE FAILED for Order: ${orderId}. Error:`, updateError.message);
        throw updateError;
    }

    console.log(`OxApay Webhook: SUCCESS. Order: ${orderId} marked as APPROVED.`);
    return new Response(JSON.stringify({ status: "success", orderId: orderId }), { status: 200 });

  } catch (error: any) {
    console.error("OxApay Webhook: UNHANDLED EXCEPTION:", error.message);
    return new Response(error.message, { status: 500 });
  }
});
