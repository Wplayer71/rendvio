"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Wand2,
  XCircle,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Sofa,
  Building2,
  Pencil,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { RENDER_MODES, type RenderMode } from "@/lib/render-prompts";
import { downloadImage } from "@/lib/download";
import { cn } from "@/lib/utils";

type Step = "upload" | "processing" | "result" | "error";

const MODE_ICONS: Record<RenderMode, React.ReactNode> = {
  interior: <Sofa className="h-5 w-5" />,
  exterior: <Building2 className="h-5 w-5" />,
  sketch: <Pencil className="h-5 w-5" />,
};

const STEPS = ["Choose Mode", "Upload Image", "Prompt & Generate"];

export default function NewRenderPage() {
  const [mode, setMode] = useState<RenderMode>("interior");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloading, setDownloading] = useState<"original" | "render" | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setStep("upload");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const runGeneration = async () => {
    if (!file) return;
    setStep("processing");
    setProgress(0);
    setErrorMessage("");

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 12));
    }, 400);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("mode", mode);
      formData.append("prompt", prompt);

      const res = await fetch("/api/render", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Render failed");
      }

      clearInterval(interval);
      setProgress(100);
      setResultUrl(data.imageUrl ?? null);
      setStep("result");
    } catch (err) {
      clearInterval(interval);
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setStep("error");
    }
  };

  const handleGenerate = () => {
    if (!file) return;
    runGeneration();
  };

  const handleReprompt = () => {
    runGeneration();
  };

  const handleNewRender = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setStep("upload");
    setProgress(0);
    setPrompt("");
    setErrorMessage("");
  };

  const handleModeChange = (m: RenderMode) => {
    setMode(m);
    setStep("upload");
  };

  const handleDownload = async (kind: "original" | "render") => {
    const url = kind === "original" ? preview : resultUrl;
    if (!url) return;
    setDownloading(kind);
    const filename =
      kind === "original"
        ? `rendvio-original-${Date.now()}.${file?.name.split(".").pop() ?? "png"}`
        : `rendvio-render-${Date.now()}.png`;
    await downloadImage(url, filename);
    setDownloading(null);
  };

  const activeStepIndex =
    step === "upload" ? (file ? 2 : 1) : 2;

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="text-xl font-bold tracking-tight">
              Rendvio
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              New Render
            </Badge>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => {
            const isDone = activeStepIndex > i;
            const isCurrent = activeStepIndex === i;
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isDone || isCurrent ? "text-zinc-900" : "text-zinc-400"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                      isDone
                        ? "bg-zinc-900 text-white"
                        : isCurrent
                          ? "border-2 border-zinc-900 text-zinc-900"
                          : "border-2 border-zinc-300"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-8 sm:w-16 bg-zinc-300" />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* ───── LEFT: CONTROL PANEL ───── */}
          <div className="space-y-6">
            {step === "upload" && (
              <>
                <Card>
                  <CardContent className="p-5">
                    <Label className="mb-3 block text-sm font-semibold">
                      1. Choose Render Mode
                    </Label>
                    <div className="grid gap-2">
                      {(Object.keys(RENDER_MODES) as RenderMode[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleModeChange(m)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                            mode === m
                              ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                              : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              mode === m
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-500"
                            )}
                          >
                            {MODE_ICONS[m]}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold">
                              {RENDER_MODES[m].label}
                            </span>
                            <span className="block text-xs text-zinc-500 mt-0.5">
                              {RENDER_MODES[m].description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <Label className="mb-3 block text-sm font-semibold">
                      2. Upload Your Image
                    </Label>
                    <div
                      {...getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                        isDragActive
                          ? "border-zinc-900 bg-zinc-100"
                          : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                      )}
                    >
                      <input {...getInputProps()} />
                      {preview ? (
                        <div className="space-y-3">
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <p className="text-sm font-medium text-zinc-700">
                            {file?.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {(file!.size / 1024 / 1024).toFixed(1)} MB — click to
                            replace
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium">
                            {isDragActive
                              ? "Drop your image here"
                              : "Drag & drop your image, or click to browse"}
                          </p>
                          <p className="text-xs text-zinc-400">
                            PNG, JPG, or WebP up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="prompt" className="text-sm font-semibold">
                        3. Describe Your Render{" "}
                        <span className="font-normal text-zinc-400">(optional)</span>
                      </Label>
                    </div>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={5}
                      placeholder="Optional — add your own instructions, e.g. 'add a fireplace and warm lighting'..."
                      className="resize-none text-sm leading-relaxed"
                    />
                    <p className="text-xs text-zinc-400 mt-2">
                      The {RENDER_MODES[mode].label} style is applied automatically in
                      the background. Anything you write here is added on top of it.
                    </p>
                  </CardContent>
                </Card>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!file}
                  onClick={handleGenerate}
                >
                  {!file ? (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload an Image to Continue
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Render
                    </>
                  )}
                </Button>
              </>
            )}

            {step === "processing" && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="relative mx-auto mb-4 h-16 w-16">
                    <Loader2 className="h-16 w-16 text-zinc-900 animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-zinc-500" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">
                    Processing your render
                  </h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    AI is analyzing your image with{" "}
                    {RENDER_MODES[mode].label} — usually 5-20 seconds.
                  </p>
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    {Math.round(Math.min(progress, 100))}%
                  </p>
                </CardContent>
              </Card>
            )}

            {step === "result" && (
              <>
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <Label className="mb-2 block text-sm font-semibold">
                        Try a Different Prompt
                      </Label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Optional — describe a new style..."
                        className="resize-none text-sm leading-relaxed"
                      />
                    </div>
                    <Button className="w-full" onClick={handleReprompt}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-render with New Prompt
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-3">
                    <Label className="block text-sm font-semibold">
                      Download Output
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload("original")}
                        disabled={downloading !== null}
                      >
                        {downloading === "original" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Original
                      </Button>
                      <Button
                        onClick={() => handleDownload("render")}
                        disabled={downloading !== null}
                      >
                        {downloading === "render" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Render
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-zinc-500"
                      onClick={handleNewRender}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start New Render
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {step === "error" && (
              <Card className="border-red-200">
                <CardContent className="p-6 text-center">
                  <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Render failed</h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    {errorMessage || "Something went wrong. Please try again."}
                  </p>
                  <Button variant="outline" onClick={handleNewRender}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ───── RIGHT: PREVIEW PANEL ───── */}
          <div>
            <Card className="sticky top-24 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4 text-zinc-400" />
                    {step === "result" ? "Result" : "Preview"}
                  </div>
                  {step === "result" && (
                    <Badge variant="outline" className="text-green-600">
                      Completed
                    </Badge>
                  )}
                </div>

                {preview && (step === "upload" || step === "result") ? (
                  <div className="p-5">
                    {step === "upload" ? (
                      <img
                        src={preview}
                        alt="Uploaded"
                        className="w-full rounded-lg"
                      />
                    ) : (
                      resultUrl && (
                        <BeforeAfterSlider
                          beforeImage={preview}
                          afterImage={resultUrl}
                          beforeLabel="Original"
                          afterLabel="Render"
                        />
                      )
                    )}
                  </div>
                ) : step === "processing" ? (
                  <div className="flex aspect-[4/3] items-center justify-center bg-zinc-50">
                    <img
                      src={preview ?? undefined}
                      alt="Source"
                      className="h-full w-full object-contain opacity-40"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-zinc-50 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200">
                      <ImageIcon className="h-7 w-7 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-600">
                        No image yet
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Upload an image to see the preview here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
