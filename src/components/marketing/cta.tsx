import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-6 py-20 text-center">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[22px] border border-primary/[0.14] bg-gradient-to-br from-primary/[0.07] to-[#8B5CF6]/[0.04] px-6 py-16 sm:px-10">
        <div
          className="pointer-events-none absolute left-1/2 top-[-100px] h-[400px] w-[500px] -translate-x-1/2"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)",
          }}
        />
        <div className="relative">
          <h2 className="mb-3.5 text-[1.75rem] font-extrabold tracking-tight text-foreground sm:text-4xl">
            Ready to stand out?
          </h2>
          <p className="mx-auto mb-7 max-w-sm text-muted-foreground">
            Get your full AI-powered analysis in under 60 seconds. No credit card
            required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Analyze My Resume</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
