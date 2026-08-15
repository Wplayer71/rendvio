import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { DownloadButton } from "@/components/download-button";

interface Props {
  params: Promise<{ id: string }>;
}

const MODE_LABELS: Record<string, string> = {
  interior: "Interior Staging",
  exterior: "Exterior Renovation",
  sketch: "Sketch to Render",
};

export default async function RenderDetailPage({ params }: Props) {
  const { id } = await params;

  const render = {
    id,
    mode: "interior",
    createdAt: "2026-08-09 14:30",
    status: "completed",
    creditsUsed: 1,
    sourceUrl: "https://placehold.co/800x600/d4d4d8/71717a?text=Original+Photo",
    resultUrl: "https://placehold.co/800x600/18181b/fafafa?text=AI+Render+Result",
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Render Details</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{MODE_LABELS[render.mode]}</Badge>
              <Badge variant="outline" className="text-green-600 capitalize">
                {render.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <DownloadButton
              url={render.sourceUrl}
              filename={`rendvio-original-${render.id}.png`}
              label="Original"
              variant="outline"
            />
            <DownloadButton
              url={render.resultUrl}
              filename={`rendvio-render-${render.id}.png`}
              label="Render"
            />
          </div>
        </div>

        <BeforeAfterSlider
          beforeImage={render.sourceUrl}
          afterImage={render.resultUrl}
          beforeLabel="Original"
          afterLabel="Render"
          className="mb-6"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-500">Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{MODE_LABELS[render.mode]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-zinc-500">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{render.createdAt}</p>
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
              <p className="font-medium">{render.creditsUsed}</p>
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
      </main>
    </div>
  );
}
