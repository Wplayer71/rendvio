"use client";

import Link from "next/link";
import {
  Upload,
  Wand2,
  Download,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKS } from "@/lib/pricing";
import { RENDER_MODES, type RenderMode } from "@/lib/render-prompts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const GALLERY_PAIRS = [
  {
    before: "/images/interior-before.png",
    after: "/images/interior-after.png",
    mode: "interior" as RenderMode,
  },
  {
    before: "/images/exterior-before.jpg",
    after: "/images/exterior-after.png",
    mode: "exterior" as RenderMode,
  },
  {
    before: "/images/sketch-before.png",
    after: "/images/sketch-after.png",
    mode: "sketch" as RenderMode,
  },
];



export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* ───── NAV ───── */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="Rendvio Logo" className="h-8 w-8" />
            Rendvio
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#how-it-works" className="text-zinc-500 transition-colors hover:text-zinc-900">
              How it works
            </a>
            <a href="#examples" className="text-zinc-500 transition-colors hover:text-zinc-900">
              Examples
            </a>
            <a href="#pricing" className="text-zinc-500 transition-colors hover:text-zinc-900">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-zinc-500 hidden sm:inline">{user.email}</span>
                <Link href="/dashboard">
                  <Button size="sm">
                    Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Get started <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ───── HERO ───── */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#f4f4f5,transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1 px-3 py-1 text-sm">
              <Zap className="h-3.5 w-3.5" />
              AI-powered rendering
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Turn any sketch or photo into a{" "}
              <span className="text-zinc-400">photorealistic render</span> — instantly, with AI.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
              Skip the 8-hour render farms. Get studio-quality architectural visualizations in under 60 seconds at a fraction of the cost.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start Rendering Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ───── EXAMPLE GALLERY ───── */}
        <section id="examples" className="bg-zinc-50 px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                See the magic in action
              </h2>
              <p className="mt-3 text-lg text-zinc-500">
                Drag the slider to compare original vs. AI render
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {GALLERY_PAIRS.map((pair, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <BeforeAfterSlider
                    beforeImage={pair.before}
                    afterImage={pair.after}
                    beforeLabel="Original"
                    afterLabel="AI Render"
                    className="aspect-[3/2]"
                  />
                  <p className="text-center text-sm font-medium text-zinc-500">
                    {RENDER_MODES[pair.mode].label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ───── HOW IT WORKS ───── */}
        <section id="how-it-works" className="bg-zinc-50 px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-lg text-zinc-500">
              From upload to render in three simple steps
            </p>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              {[
                {
                  icon: Upload,
                  title: "Upload",
                  description:
                    "Drop a photo of an empty room, a building facade, or an architectural sketch.",
                },
                {
                  icon: Wand2,
                  title: "AI Processes",
                  description:
                    "Our AI model analyzes your image and generates a photorealistic render in seconds.",
                },
                {
                  icon: Download,
                  title: "Download Render",
                  description:
                    "Download your high-resolution render instantly. Share or use it in your presentations.",
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── PRICING PREVIEW ───── */}
        <section id="pricing" className="px-6 py-24">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-lg text-zinc-500">
              Pay only for the renders you need. No subscriptions.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {CREDIT_PACKS.map((pack) => (
                <Card
                  key={pack.id}
                  className={cn(
                    "relative border-zinc-100 shadow-none transition-shadow hover:shadow-md",
                    pack.popular && "border-zinc-900 ring-1 ring-zinc-900"
                  )}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <Badge>Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                    <CardDescription>{pack.credits} credits</CardDescription>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">
                      ${pack.price}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-zinc-600">
                        <Check className="h-4 w-4 text-zinc-900" />
                        {pack.credits} high-res renders
                      </li>
                      <li className="flex items-center gap-2 text-zinc-600">
                        <Check className="h-4 w-4 text-zinc-900" />
                        All render modes
                      </li>
                      <li className="flex items-center gap-2 text-zinc-600">
                        <Check className="h-4 w-4 text-zinc-900" />
                        Commercial use license
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View full pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ───── CTA ───── */}
        <section className="bg-zinc-900 px-6 py-24 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to speed up your workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Join thousands of designers and architects who render faster with Rendvio.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" variant="secondary">
                Get started free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-zinc-100 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <img src="/logo.png" alt="Rendvio Logo" className="h-6 w-6" />
            Rendvio
          </Link>
          <nav className="flex gap-8 text-sm text-zinc-500">
            <a href="#how-it-works" className="transition-colors hover:text-zinc-900">
              How it works
            </a>
            <a href="#examples" className="transition-colors hover:text-zinc-900">
              Examples
            </a>
            <a href="#pricing" className="transition-colors hover:text-zinc-900">
              Pricing
            </a>
            <Link href="/terms" className="transition-colors hover:text-zinc-900">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-zinc-900">
              Privacy
            </Link>
          </nav>
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Rendvio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
