import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, ChevronRight, Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scoreVariant } from "@/lib/score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AnalysisListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await db.analysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      totalScore: true,
      status: true,
      createdAt: true,
      resume: { select: { title: true } },
      jobDescription: { select: { title: true, company: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Analyses</h1>
          <p className="text-sm text-muted-foreground">
            Every resume-to-job comparison you&apos;ve run, most recent first.
          </p>
        </div>
        <Button asChild>
          <Link href="/analysis/new">
            <Plus className="size-4" /> New analysis
          </Link>
        </Button>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="size-6" />}
          title="No analyses yet"
          description="Run your first analysis to see your ATS score, skill gaps, and interview prep."
          action={
            <Button asChild>
              <Link href="/analysis/new">Run an analysis</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {analyses.map((a: (typeof analyses)[number]) => (
            <Link
              key={a.id}
              href={`/analysis/${a.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-card px-5 py-4 transition-colors hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{a.jobDescription.title}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {[a.jobDescription.company, a.resume.title].filter(Boolean).join(" · ")} ·{" "}
                  {a.createdAt.toLocaleDateString()}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {a.status === "COMPLETE" ? (
                  <Badge variant={scoreVariant(a.totalScore)}>{a.totalScore}/100</Badge>
                ) : (
                  <Badge variant={a.status === "FAILED" ? "destructive" : "default"}>
                    {a.status === "FAILED" ? "Failed" : "In progress"}
                  </Badge>
                )}
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
