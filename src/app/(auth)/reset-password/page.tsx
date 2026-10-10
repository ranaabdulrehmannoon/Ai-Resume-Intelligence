"use client";

import { useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function ResetPasswordPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const linkIsValid = Boolean(email && token);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please request a new reset link.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#8B5CF6] text-white">
            <Sparkles className="size-4" />
          </div>
          <span className="font-bold text-foreground">AI Resume Intelligence</span>
        </Link>

        <Card className="p-6">
          {!linkIsValid ? (
            <div className="text-center">
              <h1 className="mb-1 text-lg font-semibold text-foreground">Invalid reset link</h1>
              <p className="text-sm text-muted-foreground">
                This link is missing required information.{" "}
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Request a new one
                </Link>
                .
              </p>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="mb-3 size-10 text-[#10B981]" />
              <h1 className="mb-1 text-lg font-semibold text-foreground">Password updated</h1>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-lg font-semibold text-foreground">Set a new password</h1>
              <p className="mb-6 text-sm text-muted-foreground">Choose a new password for {email}.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" loading={loading}>
                  {!loading && "Update password"}
                  {loading && "Updating…"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
