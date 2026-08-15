import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!signature || !verifySignature(body, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;

    if (eventName !== "order_created") {
      return NextResponse.json({ received: true });
    }

    const orderData = event.data;
    const customData = (orderData.attributes?.custom_data || orderData.attributes?.first_order_item?.custom_data) ?? {};
    const userId = customData.user_id;
    const credits = parseInt(customData.credits ?? "0", 10);

    if (!userId || !credits) {
      console.error("Missing custom data in order:", orderData.id);
      return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
    }

    const supabase = await createClient();

    // Idempotency check
    const orderId = orderData.id;
    const { data: existing } = await supabase
      .from("credit_transactions")
      .select("id")
      .eq("payment_session_id", String(orderId))
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, note: "already processed" });
    }

    // Add credits via RPC
    const { error: rpcError } = await supabase.rpc("add_credits", {
      user_id: userId,
      amount: credits,
    });

    if (rpcError) {
      // Fallback: direct update
      const { data: profile } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ credit_balance: profile.credit_balance + credits })
          .eq("id", userId);
      }
    }

    // Record transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: credits,
      reason: "purchase",
      payment_session_id: String(orderId),
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
