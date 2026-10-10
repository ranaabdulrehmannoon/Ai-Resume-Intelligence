"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // /api/auth/forgot-password issues a real, single-use, expiring
    // token. The one remaining gap is delivery: no email provider is
    // configured, so in development the reset link is logged to the
    // server console instead of emailed — see that route's comments.
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setLoading(false);
    setSent(true);
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
          {sent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="mb-3 size-10 text-[#10B981]" />
              <h1 className="mb-1 text-lg font-semibold text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for {email}, we&apos;ve sent a reset link.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-lg font-semibold text-foreground">
                Reset your password
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  {!loading && "Send reset link"}
                  {loading && "Sending..."}
                </Button>
              </form>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
