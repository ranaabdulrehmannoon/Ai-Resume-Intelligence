import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Belt-and-suspenders: middleware already redirects unauthenticated
  // requests, but this keeps the layout safe if ever rendered directly
  // (e.g. during static analysis or a middleware misconfiguration).
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={session.user.name} userEmail={session.user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav userName={session.user.name} userEmail={session.user.email} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
