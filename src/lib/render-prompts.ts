export type RenderMode = "interior" | "exterior" | "sketch";

export const RENDER_MODES: Record<
  RenderMode,
  { label: string; model: string; description: string }
> = {
  interior: {
    label: "Interior Staging",
    model: "fal-ai/nano-banana-pro/edit",
    description:
      "Empty room photo → furnished, styled room. Best for architecture and spatial accuracy.",
  },
  exterior: {
    label: "Exterior Renovation",
    model: "fal-ai/flux-pro/kontext",
    description:
      "Dated building facade → renovated modern exterior with preserved structure.",
  },
  sketch: {
    label: "Sketch to Render",
    model: "fal-ai/flux-pro/kontext",
    description:
      "Architectural line sketch → photorealistic render with accurate perspective.",
  },
};

export const RENDER_PROMPTS: Record<RenderMode, string> = {
  interior:
    "Furnish this empty room in a modern minimalist style: light wood floors, a grey sectional sofa, a low coffee table, sheer curtains, warm ambient lighting. Keep the room's architecture, walls, windows, and camera angle exactly as in the original photo.",
  exterior:
    "Transform this dated building facade into a renovated, modern exterior: fresh light-grey render, black window frames, updated entrance. Keep the building's exact structure, proportions, window positions, and surroundings unchanged.",
  sketch:
    "Convert this architectural sketch into a photorealistic render. Preserve the exact composition, perspective, and proportions from the original sketch. Add realistic materials: concrete, glass, wood, and vegetation. Use natural daylight with soft shadows.",
};
