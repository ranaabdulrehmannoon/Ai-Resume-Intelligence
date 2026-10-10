import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 pb-6 pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-[#8B5CF6]">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="text-[0.9375rem] font-bold text-foreground">
                AI Resume Intelligence
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Turn your experience into a clearer, stronger path to your next
              opportunity.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Product</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Product">
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                How it works
              </a>
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                FAQ
              </a>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Account</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Account">
              <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sign in
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Create account
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Explore</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Explore">
              <Link href="/analysis/new" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                New analysis
              </Link>
              <a href="mailto:support@resumeintelligence.ai" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Contact support
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-5 text-center">
          <p className="text-xs text-muted-foreground/70">
            © 2026 AI Resume Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
