import Link from "next/link";
import { redirect } from "next/navigation";
import { Mic, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const QUESTION_KEYS = [
  "technicalQuestions",
  "behavioralQuestions",
  "projectQuestions",
  "systemDesignQuestions",
  "resumeQuestions",
] as const;

function countQuestions(json: unknown): number {
  if (!json || typeof json !== "object") return 0;
  const record = json as Record<string, unknown>;
  return QUESTION_KEYS.reduce((sum, k) => sum + (Array.isArray(record[k]) ? (record[k] as unknown[]).length : 0), 0);
}

export default async function InterviewPrepPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const analyses = await db.analysis.findMany({
    where: { userId: session.user.id, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      interviewQuestions: true,
      createdAt: true,
      jobDescription: { select: { title: true, company: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Interview Preparation</h1>
        <p className="text-sm text-muted-foreground">
          Questions are generated per analysis, from your resume and the target role.
        </p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={<Mic className="size-6" />}
          title="No interview prep yet"
          description="Run an analysis first — your questions are tailored to your resume and the specific job."
          action={
            <Button asChild>
              <Link href="/analysis/new">Run an analysis</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {analyses.map((a: (typeof analyses)[number]) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{a.jobDescription.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.jobDescription.company ?? "—"} · {a.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{countQuestions(a.interviewQuestions)} questions</Badge>
                  <Link
                    href={`/analysis/${a.id}?tab=interview`}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Open <ArrowRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
