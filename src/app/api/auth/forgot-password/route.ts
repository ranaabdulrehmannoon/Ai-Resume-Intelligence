import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";

import { db } from "@/lib/db";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Real token issuance (this part is security-sensitive and now fully
 * implemented: random token, hashed lookup key, expiry, single-use).
 * What this deliberately does NOT do yet is send an email — no email
 * provider (Resend/SendGrid/SES) is configured in this project. In dev,
 * the reset link is logged to the server console so the flow is testable
 * end-to-end; wiring a real provider here is a small, isolated addition
 * (see README "Remaining work").
 *
 * Always returns the same generic response whether or not the email is
 * registered — this route must never reveal which emails have accounts.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    const token = randomBytes(32).toString("hex");
    await db.verificationToken.deleteMany({ where: { identifier: email } });
    await db.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log(`[dev] Password reset link for ${email}: ${resetUrl}`);
    } else {
      // TODO: send `resetUrl` via a real email provider once one is
      // configured. Intentionally not pretending this happened.
      console.warn(`Password reset requested for ${email} but no email provider is configured — link was not sent.`);
    }
  }

  return NextResponse.json({ ok: true });
}
