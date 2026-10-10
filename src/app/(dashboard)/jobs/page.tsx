import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { JobCreator } from "@/components/upload/job-creator";

export default async function JobsPage() {
  const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jobs = await db.jobDescription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, company: true, location: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Job Descriptions</h1>
        <p className="text-sm text-muted-foreground">
          Save the roles you&apos;re targeting, then compare any resume against them.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a job description</CardTitle>
        </CardHeader>
        <CardContent>
          <JobCreator maxSizeMb={maxSizeMb} />
        </CardContent>
      </Card>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-6" />}
          title="No job descriptions yet"
          description="Paste a job posting above. We'll extract its required skills when you run an analysis."
        />
      ) : (
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-muted-foreground">Saved roles ({jobs.length})</h2>
          {jobs.map((j: (typeof jobs)[number]) => (
            <Card key={j.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{j.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {[j.company, j.location].filter(Boolean).join(" · ") || "No company listed"} · Added{" "}
                    {j.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/analysis/new?jobId=${j.id}`}>
                    Analyze <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
