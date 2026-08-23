"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  User,
  Building2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { CREDIT_PACKS, SIGNUP_BONUS_CREDITS } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Step = "name" | "plan";

const STEPS = ["About You", "Choose Plan"];

export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          company: company.trim() || null,
        })
        .eq("id", user.id);

      if (error) throw new Error(error.message);

      try {
        localStorage.setItem(
          "rendvio-profile",
          JSON.stringify({ fullName: fullName.trim() })
        );
      } catch {
        // ignore
      }

      setStep("plan");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save your details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    setLoadingPack(packId);
    setError("");
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
        setError(data.error || "Failed to create checkout session");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingPack(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Rendvio
          </Link>
          <span className="text-sm text-zinc-500">{user?.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Rendvio!</h1>
          <p className="text-zinc-500">
            Let&apos;s set up your account in two quick steps.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => {
            const isDone = step === "plan" && i === 0;
            const isCurrent = (step === "name" && i === 0) || (step === "plan" && i === 1);
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
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-8 sm:w-16 bg-zinc-300" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === "name" && (
          <Card>
            <form onSubmit={handleSaveName}>
              <CardHeader>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>
                  This helps us personalize your experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="fullName"
                      placeholder="Jane Doe"
                      className="pl-10"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company / Studio{" "}
                    <span className="font-normal text-zinc-400">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="company"
                      placeholder="Your architecture firm or studio"
                      className="pl-10"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === "plan" && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Free Plan
                    <Badge variant="secondary">Included</Badge>
                  </CardTitle>
                  <CardDescription>
                    You already have {SIGNUP_BONUS_CREDITS} free credits to try
                    all render modes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Continue with Free Plan
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>

            <h2 className="text-lg font-semibold mb-4">
              Or start with a credit pack
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {CREDIT_PACKS.map((pack) => (
                <Card
                  key={pack.id}
                  className={cn(
                    "relative flex flex-col",
                    pack.popular && "border-zinc-900 shadow-lg"
                  )}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge>Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pack.name}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-zinc-900">
                        ${pack.price}
                      </span>
                      <span className="text-zinc-500"> one-time</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-zinc-400" />
                      <span className="font-semibold">{pack.credits} credits</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={pack.popular ? "default" : "outline"}
                      onClick={() => handlePurchase(pack.id)}
                      disabled={loadingPack !== null}
                    >
                      {loadingPack === pack.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Get {pack.credits} Credits
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setStep("name")}
                className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to your details
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
