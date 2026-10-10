import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toAnalysisResult } from "@/lib/analysis-adapter";
import { AnalysisView } from "@/components/analysis/analysis-view";
import type { AnalysisTab } from "@/components/analysis/analysis-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StructuredResume } from "@/lib/ai";

export default async function AnalysisDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Ownership check happens in the query itself (not after the fact) —
  // a row that exists but belongs to someone else looks identical to a
  // row that doesn't exist at all, which is exactly what we want: no
  // signal is leaked about other users' data.
  const analysis = await db.analysis.findFirst({
    where: { id, userId: session.user.id },
    include: { resume: true, jobDescription: true },
  });

  if (!analysis) notFound();

  if (analysis.status === "FAILED") {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="mb-1.5 text-base font-semibold text-foreground">Analysis failed</h2>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              {analysis.errorMessage || "Something went wrong while analyzing this resume."}
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/analysis/new">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analysis.status === "PENDING" || analysis.status === "PROCESSING") {
    return (
      <div className="mx-auto max-w-2xl">
        <BackLink />
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Loader2 className="mb-4 size-8 animate-spin text-primary" />
            <h2 className="mb-1.5 text-base font-semibold text-foreground">Analysis in progress</h2>
            <p className="text-sm text-muted-foreground">This page will update automatically. Refresh in a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Latest structured extraction, if one was persisted (see /api/analysis)
  // — used for the candidate's real name and an accurate years-of-
  // experience figure. Falls back gracefully if absent.
  const latestVersion = await db.resumeVersion.findFirst({
    where: { resumeId: analysis.resumeId },
    orderBy: { version: "desc" },
  });

  const structuredResume = latestVersion
    ? ({
        candidate: latestVersion.candidate,
        summary: latestVersion.summary,
        skills: latestVersion.skills,
        experience: latestVersion.experience,
        education: latestVersion.education,
        projects: latestVersion.projects,
        certifications: latestVersion.certifications,
        achievements: latestVersion.achievements,
      } as unknown as StructuredResume)
    : null;

  const result = toAnalysisResult(analysis, analysis.resume, analysis.jobDescription, structuredResume);

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />
      <AnalysisView analysis={result} initialTab={isAnalysisTab(tab) ? tab : "overview"} />
    </div>
  );
}

const ANALYSIS_TABS = ["overview", "skills", "gaps", "bullets", "recommendations", "interview"] as const;

function isAnalysisTab(value: string | undefined): value is AnalysisTab {
  return !!value && (ANALYSIS_TABS as readonly string[]).includes(value);
}

function BackLink() {
  return (
    <Link
      href="/analysis"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> Back to analyses
    </Link>
  );
}
