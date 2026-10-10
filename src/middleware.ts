import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Deliberately built from the edge-safe `authConfig` only (see
// auth.config.ts) — never from the full `auth.ts`, which pulls in
// Prisma and bcrypt and cannot run on the Edge runtime that middleware
// executes on. The `authorized` callback in authConfig does the actual
// route-protection check.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
