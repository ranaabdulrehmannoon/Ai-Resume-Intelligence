import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resumes",
  "/jobs",
  "/analysis",
  "/interview",
  "/settings",
];

// Edge-runtime-safe config: no Prisma adapter, no bcrypt, no providers
// that touch Node-only APIs. Middleware runs on the Edge runtime, where
// the Prisma Client (Node-only, even once generated) cannot execute —
// so this file is intentionally the *only* thing middleware imports.
// The full config (adapter + Credentials provider) lives in auth.ts and
// is only ever imported from Node-runtime code (API routes, RSCs).
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some((p) =>
        request.nextUrl.pathname.startsWith(p)
      );
      return isProtected ? isLoggedIn : true;
    },
  },
} satisfies NextAuthConfig;
