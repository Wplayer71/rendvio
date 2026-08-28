"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Zap, ArrowRight, ExternalLink, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKS } from "@/lib/pricing";

const FEATURES = [
  "All render modes (Interior, Exterior, Sketch)",
  "Full-resolution downloads",
  "Render history",
  "Email support",
];

export default function BillingPage() {
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoadingPack(packId);
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPack(null);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="Rendvio Logo" className="h-7 w-7" />
            Rendvio
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
          <p className="text-zinc-500">Manage your plan and purchase credits</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">3</div>
              <p className="text-sm text-zinc-500 mt-1">credits remaining</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">Free</div>
              <p className="text-sm text-zinc-500 mt-1">Pay as you go</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-6">Purchase Credits</h2>
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`relative ${pack.popular ? "border-zinc-900 shadow-lg" : ""}`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{pack.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-zinc-900">${pack.price}</span>
                  <span className="text-zinc-500"> one-time</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-zinc-400" />
                  <span className="font-semibold">{pack.credits} credits</span>
                </div>
                <p className="text-sm text-zinc-500">
                  ${(pack.price / pack.credits).toFixed(2)} per render
                </p>
                <ul className="space-y-1 mt-4">
                  {FEATURES.map((f) => (
                    <li key={f} className="text-sm text-zinc-600 flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={pack.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(pack.id)}
                  disabled={loadingPack === pack.id}
                >
                  {loadingPack === pack.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {loadingPack === pack.id ? "Redirecting..." : "Purchase"}
                  {loadingPack !== pack.id && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center pb-12">
          <p className="text-sm text-zinc-500 mb-4">Need to manage your subscription?</p>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe Customer Portal
          </Button>
        </div>
      </main>
    </div>
  );
}
