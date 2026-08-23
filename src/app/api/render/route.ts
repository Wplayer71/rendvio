import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { submitRender } from "@/lib/fal-client";
import { RENDER_PROMPTS, type RenderMode } from "@/lib/render-prompts";
import type { Render } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function publicUrl(bucket: string, path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const mode = formData.get("mode") as string | null;
    const customPrompt = ((formData.get("prompt") as string) ?? "").trim();

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

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: "Rendering is not configured yet (FAL_KEY missing)." },
        { status: 503 }
      );
    }

    // Combine mode prompt (always applied) with optional user prompt
    const finalPrompt = customPrompt
      ? `${RENDER_PROMPTS[mode as RenderMode]}\n\nAdditional instructions from the user (apply them, do not contradict the main task): ${customPrompt}`
      : RENDER_PROMPTS[mode as RenderMode];

    // Convert image to base64 for fal.ai
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageBase64 = imageBuffer.toString("base64");
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Call fal.ai
    let result;
    try {
      result = await submitRender(
        mode as RenderMode,
        imageDataUrl,
        finalPrompt
      );
    } catch (falError) {
      console.error("fal.ai render failed:", falError);
      return NextResponse.json(
        { error: "AI rendering failed. Please try again." },
        { status: 500 }
      );
    }

    if (!result.imageUrl) {
      return NextResponse.json(
        { error: "AI rendering failed: no image returned." },
        { status: 500 }
      );
    }

    // Upload source + result images to Supabase Storage
    const serviceClient = createServiceClient();
    const ext = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
    const owner = user?.id ?? "anonymous";
    const id = crypto.randomUUID();
    const sourcePath = `${owner}/${id}.${ext}`;
    const resultPath = `${owner}/${id}.png`;

    let sourceImageUrl = imageDataUrl;
    try {
      await serviceClient.storage
        .from("source-images")
        .upload(sourcePath, imageBuffer, {
          contentType: image.type,
          upsert: false,
        });
      sourceImageUrl = publicUrl("source-images", sourcePath);
    } catch (storageError) {
      console.error("Failed to upload source image:", storageError);
    }

    let resultImageUrl = result.imageUrl;
    try {
      const res = await fetch(result.imageUrl);
      if (res.ok) {
        const resultBuffer = Buffer.from(await res.arrayBuffer());
        await serviceClient.storage
          .from("renders")
          .upload(resultPath, resultBuffer, {
            contentType: "image/png",
            upsert: false,
          });
        resultImageUrl = publicUrl("renders", resultPath);
      }
    } catch (storageError) {
      console.error("Failed to upload result image:", storageError);
    }

    // Deduct credit for authenticated users
    if (user) {
      await supabase.rpc("decrement_credit", {
        user_id: user.id,
      });

      // Record the transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        amount: -1,
        reason: "render",
      });
    }

    // Store render record
    const renderData = {
      user_id: user?.id ?? null,
      mode,
      source_image_url: sourceImageUrl,
      result_image_url: resultImageUrl,
      prompt: finalPrompt,
      status: "completed",
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
        imageUrl: resultImageUrl,
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
