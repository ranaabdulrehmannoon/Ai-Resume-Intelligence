"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="size-4" /> Log out
    </Button>
  );
}
