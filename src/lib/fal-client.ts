import { fal } from "@fal-ai/client";
import { RENDER_PROMPTS, type RenderMode } from "./render-prompts";

export interface RenderResult {
  requestId: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  error?: string;
}

function getFalConfig() {
  return {
    credentials: process.env.FAL_KEY!,
  };
}

export async function submitRender(
  mode: RenderMode,
  imageUrl: string,
  prompt?: string
): Promise<RenderResult> {
  const finalPrompt = prompt || RENDER_PROMPTS[mode];

  fal.config(getFalConfig());

  if (mode === "interior") {
    const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
      input: {
        prompt: finalPrompt,
        image_urls: [imageUrl],
      },
    });

    return {
      requestId: result.requestId,
      status: "completed",
      imageUrl: (result.data as { images?: Array<{ url: string }> })?.images?.[0]?.url ||
        (result.data as { image?: { url: string } })?.image?.url,
    };
  }

  const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      prompt: finalPrompt,
      image_url: imageUrl,
    },
  });

  return {
    requestId: result.requestId,
    status: "completed",
    imageUrl: (result.data as { images?: Array<{ url: string }> })?.images?.[0]?.url ||
      (result.data as { image?: { url: string } })?.image?.url,
  };
}

export async function checkStatus(
  requestId: string
): Promise<RenderResult> {
  fal.config(getFalConfig());

  const result = await fal.queue.result("fal-ai/flux-pro/kontext", {
    requestId,
  });

  return {
    requestId: result.requestId,
    status: (result.data as { status?: string })?.status as RenderResult["status"] || "completed",
    imageUrl: (result.data as { images?: Array<{ url: string }> })?.images?.[0]?.url ||
      (result.data as { image?: { url: string } })?.image?.url,
  };
}
