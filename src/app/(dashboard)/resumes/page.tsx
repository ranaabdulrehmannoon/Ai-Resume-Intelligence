import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/upload/resume-uploader";

export default async function ResumesPage() {
  const maxSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 5);
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const resumes = await db.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, fileType: true, createdAt: true, _count: { select: { analyses: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">My Resumes</h1>
        <p className="text-sm text-muted-foreground">
          Upload a resume once, then run it against as many job descriptions as you like.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a resume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUploader maxSizeMb={maxSizeMb} />
        </CardContent>
      </Card>

      {resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No resumes yet"
          description="Upload or paste your first resume above. It's the starting point for every analysis."
        />
      ) : (
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-muted-foreground">Your resumes ({resumes.length})</h2>
          {resumes.map((r: (typeof resumes)[number]) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{r.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge>{(r.fileType ?? "text").toUpperCase()}</Badge>
                    <span>Added {r.createdAt.toLocaleDateString()}</span>
                    <span>· {r._count.analyses} {r._count.analyses === 1 ? "analysis" : "analyses"}</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/analysis/new?resumeId=${r.id}`}>
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
