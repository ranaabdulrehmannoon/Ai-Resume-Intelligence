import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Briefcase } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { NewAnalysisForm } from "@/components/analysis/new-analysis-form";

export default async function NewAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ resumeId?: string; jobId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { resumeId, jobId } = await searchParams;
  const userId = session.user.id;

  const [resumes, jobs] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    }),
    db.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, company: true },
    }),
  ]);

  // Guide the user to whichever prerequisite is missing instead of
  // showing a form they can't complete.
  if (resumes.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={<FileText className="size-6" />}
          title="Start by adding a resume"
          description="An analysis compares one of your resumes against a job. Upload or paste a resume first."
          action={
            <Button asChild>
              <Link href="/resumes">Add a resume</Link>
            </Button>
          }
        />
      </div>
    );
  }
  if (jobs.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={<Briefcase className="size-6" />}
          title="Now add a job description"
          description="Paste the posting for the role you're targeting, then come back to run your analysis."
          action={
            <Button asChild>
              <Link href="/jobs">Add a job description</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">New Analysis</h1>
        <p className="text-sm text-muted-foreground">Pick a resume and a role to see how well they match.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <NewAnalysisForm
            resumes={resumes.map((r: (typeof resumes)[number]) => ({
              id: r.id,
              label: r.title,
              sublabel: `Added ${r.createdAt.toLocaleDateString()}`,
            }))}
            jobs={jobs.map((j: (typeof jobs)[number]) => ({ id: j.id, label: j.title, sublabel: j.company ?? undefined }))}
            initialResumeId={resumeId}
            initialJobId={jobId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
