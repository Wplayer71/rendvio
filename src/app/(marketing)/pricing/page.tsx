import Link from "next/link";
import { Check, Zap, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKS } from "@/lib/pricing";

const PACK_FEATURES: Record<string, string[]> = {
  starter: [
    "5 AI-powered renders",
    "All rendering modes",
    "Download HD images",
    "Email support",
  ],
  pro: [
    "25 AI-powered renders",
    "All rendering modes",
    "Download HD images",
    "Priority support",
    "Faster processing queue",
  ],
  studio: [
    "100 AI-powered renders",
    "All rendering modes",
    "Download HD images",
    "Priority support",
    "Faster processing queue",
    "Batch rendering",
  ],
};

const FAQ_ITEMS = [
  {
    question: "What is a credit?",
    answer:
      "One credit equals one AI render. Each time you submit an image for rendering, one credit is deducted from your account balance.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No, credits never expire. You can use them at any time — there's no monthly limit or subscription commitment.",
  },
  {
    question: "What rendering modes are supported?",
    answer:
      "Rendvio supports Interior Staging (furnish empty rooms), Exterior Renovation (modernize building facades), and Sketch to Render (turn architectural sketches into photorealistic images).",
  },
  {
    question: "Can I try before I buy?",
    answer:
      "Yes. New users get 3 free credits upon signup, and you can try a single render anonymously without creating an account.",
  },
];

export default function PricingPage() {
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
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-zinc-500">
              Buy credits when you need them. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {CREDIT_PACKS.map((pack) => (
              <Card
                key={pack.id}
                className={pack.popular ? "relative border-zinc-900 shadow-lg" : ""}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-zinc-900 text-white hover:bg-zinc-900">
                      <Star className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{pack.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-zinc-900">
                      ${pack.price}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-zinc-500">
                    <Zap className="mr-1 inline h-4 w-4 text-zinc-900" />
                    <span className="font-medium text-zinc-900">
                      {pack.credits} credits
                    </span>
                  </p>
                  <ul className="space-y-2">
                    {PACK_FEATURES[pack.id].map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-zinc-600"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button
                      variant={pack.popular ? "default" : "outline"}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-zinc-900">
                  {faq.question}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{faq.answer}</p>
              </div>
            ))}
          </div>
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
