import { fal } from "@fal-ai/client";
import { RENDER_MODES, RENDER_PROMPTS, type RenderMode } from "./render-prompts";

export interface RenderResult {
  requestId: string;
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
  inputImageUrl?: string;
  error?: string;
}

function getFalConfig() {
  return {
    credentials: process.env.FAL_KEY!,
  };
}

export async function submitRender(
  mode: RenderMode,
  image: File,
  prompt?: string
): Promise<RenderResult> {
  const model = RENDER_MODES[mode].model;
  const finalPrompt = prompt || RENDER_PROMPTS[mode];

  fal.config(getFalConfig());

  // Upload the source image to fal storage and get a public URL
  const inputImageUrl = await fal.storage.upload(image);

  const result = await fal.subscribe(model, {
    input: {
      image_url: inputImageUrl,
      prompt: finalPrompt,
      output_format: "png",
      num_images: 1,
    },
  });

  return {
    requestId: result.requestId,
    status: "completed",
    imageUrl:
      (result.data as { images?: Array<{ url: string }> })?.images?.[0]?.url,
    inputImageUrl,
  };
}
