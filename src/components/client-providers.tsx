"use client";

import { AuthProvider } from "@/components/auth-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
