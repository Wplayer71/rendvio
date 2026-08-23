"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Loader2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { DownloadButton } from "@/components/download-button";
import { createClient } from "@/lib/supabase/client";
import type { Render } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

const MODE_LABELS: Record<string, string> = {
  interior: "Interior Staging",
  exterior: "Exterior Renovation",
  sketch: "Sketch to Render",
};

export default function RenderDetailPage({ params }: Props) {
  const [render, setRender] = useState<Render | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    params
      .then(({ id }) =>
        supabase.from("renders").select("*").eq("id", id).single()
      )
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setError("Render not found.");
        } else {
          setRender(data as Render);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <Loader2 className="h-6 w-6 mr-2 animate-spin" />
            Loading render...
          </div>
        ) : error || !render ? (
          <div className="text-center py-20">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-zinc-500 mb-6">{error || "Render not found."}</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Render Details</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {MODE_LABELS[render.mode] ?? render.mode}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 capitalize">
                    {render.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton
                  url={render.source_image_url}
                  filename={`rendvio-original-${render.id}.png`}
                  label="Original"
                  variant="outline"
                />
                {render.result_image_url && (
                  <DownloadButton
                    url={render.result_image_url}
                    filename={`rendvio-render-${render.id}.png`}
                    label="Render"
                  />
                )}
              </div>
            </div>

            {render.result_image_url ? (
              <BeforeAfterSlider
                beforeImage={render.source_image_url}
                afterImage={render.result_image_url}
                beforeLabel="Original"
                afterLabel="Render"
                className="mb-6"
              />
            ) : (
              <div className="mb-6 rounded-xl bg-zinc-100 p-10 text-center text-zinc-500 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                {render.status === "failed"
                  ? "This render failed. No result image is available."
                  : "Result image is not available yet."}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-500">Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{MODE_LABELS[render.mode] ?? render.mode}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-500">Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{formatDate(render.created_at)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-500">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium capitalize">{render.status}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-500">Credits Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">1</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Link href="/dashboard/new">
                <Button size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Render Again with Different Style
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
