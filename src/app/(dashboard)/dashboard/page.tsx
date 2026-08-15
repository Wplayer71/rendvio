"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Image as ImageIcon,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  User,
  KeyRound,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";

const MOCK_RENDERS = [
  { id: "1", mode: "interior", date: "2026-08-09", status: "completed", thumbnail: "https://placehold.co/400x300/18181b/fafafa?text=Render+1" },
  { id: "2", mode: "exterior", date: "2026-08-08", status: "completed", thumbnail: "https://placehold.co/400x300/18181b/fafafa?text=Render+2" },
  { id: "3", mode: "sketch", date: "2026-08-07", status: "failed", thumbnail: "https://placehold.co/400x300/fef2f2/dc2626?text=Failed" },
  { id: "4", mode: "interior", date: "2026-08-06", status: "processing", thumbnail: "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Processing" },
];

const MODE_LABELS: Record<string, string> = {
  interior: "Interior Staging",
  exterior: "Exterior Renovation",
  sketch: "Sketch to Render",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  processing: <Clock className="h-4 w-4 text-amber-500 animate-spin" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

type Tab = "overview" | "settings";

const PROFILE_STORAGE_KEY = "rendvio-profile";

interface ProfileData {
  fullName: string;
}

export default function DashboardPage() {
  const [renders] = useState(MOCK_RENDERS);
  const [tab, setTab] = useState<Tab>("overview");
  const { user, signOut } = useAuth();

  const [fullName, setFullName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ProfileData;
        return data.fullName ?? "";
      }
    } catch {
      // ignore
    }
    return "";
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSaveProfile = () => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ fullName }));
    } catch {
      // ignore
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = () => {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  const email = user?.email || "demo@rendvio.app";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Rendvio
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-zinc-500">{email}</span>
            <Link href="/dashboard/billing" className="text-sm text-zinc-600 hover:text-zinc-900">
              Billing
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" suppressHydrationWarning>
              {fullName ? `Welcome back, ${fullName.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {tab === "overview"
                ? "Manage your renders and credits"
                : "Update your profile information"}
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Render
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex gap-1 border-b border-zinc-200">
          <button
            onClick={() => setTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "overview"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "settings"
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <User className="h-4 w-4" />
            Profile Settings
          </button>
        </div>

        {tab === "overview" && (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Credits Available
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3</div>
                  <p className="text-xs text-zinc-500 mt-1">Free plan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Total Renders
                  </CardTitle>
                  <ImageIcon className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{renders.length}</div>
                  <p className="text-xs text-zinc-500 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    New Render
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/new">
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Render
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-lg font-semibold mb-4">Render History</h2>

            {renders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
                <ImageIcon className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500">No renders yet. Create your first render!</p>
                <Link href="/dashboard/new" className="mt-4 inline-block">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Render
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {renders.map((render) => (
                  <Link key={render.id} href={`/dashboard/render/${render.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="aspect-[4/3] bg-zinc-100 relative">
                        <img
                          src={render.thumbnail}
                          alt={`Render ${render.id}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {MODE_LABELS[render.mode]}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">{render.date}</span>
                          <span className="flex items-center gap-1 text-xs">
                            {STATUS_ICONS[render.status]}
                            <span className="capitalize">{render.status}</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "settings" && (
          <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4 text-zinc-400" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={email} disabled className="bg-zinc-50" />
                  <p className="text-xs text-zinc-400">
                    Email address cannot be changed.
                  </p>
                </div>
                <Button onClick={handleSaveProfile}>
                  {profileSaved ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-zinc-400" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Use at least 6 characters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
                <Button onClick={handleChangePassword}>
                  {passwordSaved ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Password Updated
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
