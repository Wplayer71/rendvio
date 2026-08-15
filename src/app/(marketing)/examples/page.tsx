"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/before-after-slider";

const EXAMPLES = [
  {
    id: "interior-1",
    mode: "Interior Staging",
    category: "interior",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
  {
    id: "interior-2",
    mode: "Interior Staging",
    category: "interior",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
  {
    id: "interior-3",
    mode: "Interior Staging",
    category: "interior",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
  {
    id: "exterior-1",
    mode: "Exterior Renovation",
    category: "exterior",
    before: "/examples/exterior-before.jpg",
    after: "/examples/exterior-after.png",
  },
  {
    id: "exterior-2",
    mode: "Exterior Renovation",
    category: "exterior",
    before: "/examples/exterior-before.jpg",
    after: "/examples/exterior-after.png",
  },
  {
    id: "exterior-3",
    mode: "Exterior Renovation",
    category: "exterior",
    before: "/examples/exterior-before.jpg",
    after: "/examples/exterior-after.png",
  },
  {
    id: "sketch-1",
    mode: "Sketch to Render",
    category: "sketch",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
  {
    id: "sketch-2",
    mode: "Sketch to Render",
    category: "sketch",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
  {
    id: "sketch-3",
    mode: "Sketch to Render",
    category: "sketch",
    before: "https://placehold.co/600x400/d4d4d8/71717a?text=Before",
    after: "https://placehold.co/600x400/18181b/fafafa?text=After",
  },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Interior", value: "interior" },
  { label: "Exterior", value: "exterior" },
  { label: "Sketch", value: "sketch" },
] as const;

export default function ExamplesPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? EXAMPLES
      : EXAMPLES.filter((e) => e.category === filter);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Render Examples
            </h1>
            <p className="mt-4 text-lg text-zinc-500">
              See the quality and range of our AI-powered architectural
              rendering engine.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((example) => (
              <div key={example.id} className="space-y-3">
                <BeforeAfterSlider
                  beforeImage={example.before}
                  afterImage={example.after}
                  beforeLabel="Before"
                  afterLabel="After"
                />
                <p className="text-sm font-medium text-zinc-600 text-center">
                  {example.mode}
                </p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-zinc-400 mt-12">
              No examples found for this category.
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-zinc-400">
          &copy; {new Date().getFullYear()} Rendvio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
