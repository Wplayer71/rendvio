import { NextRequest, NextResponse } from "next/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import { getPackById } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const packId = body.packId as string | undefined;

    if (!packId) {
      return NextResponse.json(
        { error: "Missing required field: packId" },
        { status: 400 }
      );
    }

    const pack = getPackById(packId);

    if (!pack || !pack.variantId) {
      return NextResponse.json(
        { error: "Invalid credit pack or missing variant configuration" },
        { status: 400 }
      );
    }

    lemonSqueezySetup({
      apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    });

    const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

    const { data: checkout, error } = await createCheckout(
      storeId,
      pack.variantId,
      {
        checkoutData: {
          email: user.email,
          custom: {
            user_id: user.id,
            pack_id: pack.id,
            credits: String(pack.credits),
          },
        },
        checkoutOptions: {
          buttonColor: "#18181b",
        },
        productOptions: {
          redirectUrl: `${request.nextUrl.origin}/dashboard?checkout=success`,
        },
      }
    );

    if (error) {
      console.error("Lemon Squeezy checkout error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkout.data.attributes.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
