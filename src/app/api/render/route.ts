import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { submitRender } from "@/lib/fal-client";
import type { Render } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const mode = formData.get("mode") as string | null;

    if (!image || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: image and mode" },
        { status: 400 }
      );
    }

    const validModes = ["interior", "exterior", "sketch"];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: `Invalid render mode. Must be one of: ${validModes.join(", ")}` },
        { status: 400 }
      );
    }

    // Image validation
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 10MB" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Image must be PNG, JPEG, or WebP" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Anonymous trial check
    if (!user) {
      const serviceClient = createServiceClient();
      const identifier =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const { data: existingTrials, error: trialError } = await serviceClient
        .from("anonymous_trials")
        .select("id")
        .eq("ip_address", identifier);

      if (trialError) {
        console.error("Trial check error:", trialError);
        return NextResponse.json(
          { error: "Failed to verify trial eligibility" },
          { status: 500 }
        );
      }

      if (existingTrials && existingTrials.length >= 1) {
        return NextResponse.json(
          { error: "Free trial limit reached. Please sign up for more renders." },
          { status: 403 }
        );
      }

      // Record the trial
      await serviceClient.from("anonymous_trials").insert({
        identifier_hash: identifier,
        ip_address: identifier,
      });
    }

    // Check user credits
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json(
          { error: "Failed to load account" },
          { status: 500 }
        );
      }

      if (profile.credit_balance < 1) {
        return NextResponse.json(
          { error: "Insufficient credits. Purchase more to continue." },
          { status: 402 }
        );
      }
    }

    // Convert image to base64 for fal.ai
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Call fal.ai
    let result;
    try {
      result = await submitRender(
        mode as "interior" | "exterior" | "sketch",
        imageDataUrl
      );
    } catch (falError) {
      console.error("fal.ai render failed:", falError);
      return NextResponse.json(
        { error: "AI rendering failed. Please try again." },
        { status: 500 }
      );
    }

    // Deduct credit for authenticated users
    if (user) {
      const { error: deductError } = await supabase
        .from("profiles")
        .update({ credit_balance: 0 })
        .eq("id", user.id)
        .lt("credit_balance", 1);

      if (!deductError) {
        await supabase.rpc("decrement_credit", {
          user_id: user.id,
        });
      } else {
        // Fallback: direct update if RPC doesn't exist
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("credit_balance")
          .eq("id", user.id)
          .single();

        if (currentProfile) {
          const newBalance = Math.max(0, currentProfile.credit_balance - 1);
          await supabase
            .from("profiles")
            .update({ credit_balance: newBalance })
            .eq("id", user.id);
        }
      }

      // Record the transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        amount: -1,
        reason: "render",
      });
    }

    // Store render record
    const serviceClient = createServiceClient();
    const renderData = {
      user_id: user?.id ?? null,
      mode,
      source_image_url: imageDataUrl.substring(0, 255),
      result_image_url: result.imageUrl ?? null,
      status: result.status,
      fal_request_id: result.requestId,
    };

    const { data: renderRecord, error: insertError } = await serviceClient
      .from("renders")
      .insert(renderData)
      .select()
      .single<Render>();

    if (insertError) {
      console.error("Failed to store render record:", insertError);
    }

    return NextResponse.json(
      {
        render: renderRecord ?? { ...renderData, id: "local", created_at: new Date().toISOString() },
        requestId: result.requestId,
        imageUrl: result.imageUrl,
        status: result.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Render API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
