import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Briefcase, TrendingUp, ArrowRight, Plus, Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { scoreVariant } from "@/lib/score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [resumeCount, jobCount, completed, recent] = await Promise.all([
    db.resume.count({ where: { userId } }),
    db.jobDescription.count({ where: { userId } }),
    db.analysis.count({ where: { userId, status: "COMPLETE" } }),
    db.analysis.findMany({
      where: { userId, status: "COMPLETE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        totalScore: true,
        createdAt: true,
        jobDescription: { select: { title: true, company: true } },
      },
    }),
  ]);

  const latest = recent[0];
  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">Your resume intelligence at a glance.</p>
        </div>
        <Button asChild>
          <Link href="/analysis/new">
            <Plus className="size-4" /> New analysis
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="size-4" />}
          tint="bg-primary/10 text-primary"
          value={latest ? `${latest.totalScore}/100` : "—"}
          label="Latest ATS score"
        />
        <StatCard
          icon={<FileText className="size-4" />}
          tint="bg-[#10B981]/10 text-[#10B981]"
          value={String(resumeCount)}
          label={resumeCount === 1 ? "Resume on file" : "Resumes on file"}
        />
        <StatCard
          icon={<Briefcase className="size-4" />}
          tint="bg-[#8B5CF6]/10 text-[#8B5CF6]"
          value={String(jobCount)}
          label={jobCount === 1 ? "Saved role" : "Saved roles"}
        />
      </div>

      {completed === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title={resumeCount === 0 ? "Let's analyze your first resume" : "You're ready to run an analysis"}
          description={
            resumeCount === 0
              ? "Add a resume and a job description, and we'll show you your ATS score, skill gaps, and interview prep."
              : "Pick a resume and a role to see how well they match."
          }
          action={
            <Button asChild>
              <Link href={resumeCount === 0 ? "/resumes" : "/analysis/new"}>
                {resumeCount === 0 ? "Add a resume" : "Run an analysis"}
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent analyses</CardTitle>
            <Link
              href="/analysis"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recent.map((a: (typeof recent)[number]) => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{a.jobDescription.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.jobDescription.company ?? "—"} · {a.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={scoreVariant(a.totalScore)}>{a.totalScore}/100</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: string;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`mb-2 flex size-9 items-center justify-center rounded-lg ${tint}`}>{icon}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
