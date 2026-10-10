"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

const STAGES = [
  "Reading your resume…",
  "Analyzing the job description…",
  "Matching skills…",
  "Scoring your profile…",
  "Writing recommendations…",
];
const STAGE_INTERVAL_MS = 4000;

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <Label asChild>
        <legend>{label}</legend>
      </Label>
      <div className="space-y-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex w-full flex-col rounded-xl border px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === o.id
                ? "border-primary/40 bg-primary/[0.07]"
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
            )}
          >
            <span className="truncate text-sm font-medium text-foreground">{o.label}</span>
            {o.sublabel && <span className="truncate text-xs text-muted-foreground">{o.sublabel}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function NewAnalysisForm({
  resumes,
  jobs,
  initialResumeId,
  initialJobId,
}: {
  resumes: Option[];
  jobs: Option[];
  initialResumeId?: string;
  initialJobId?: string;
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(
    resumes.some((r) => r.id === initialResumeId) ? initialResumeId! : resumes.length === 1 ? resumes[0].id : ""
  );
  const [jobId, setJobId] = useState(
    jobs.some((j) => j.id === initialJobId) ? initialJobId! : jobs.length === 1 ? jobs[0].id : ""
  );
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setStage(0);
    // The stage text is a cosmetic hint only — it advances on a timer
    // while ONE real request is in flight, and is replaced by the actual
    // result the moment the server responds.
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), STAGE_INTERVAL_MS);
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescriptionId: jobId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "The analysis failed. Please try again.");
        setRunning(false);
        return;
      }
      router.push(`/analysis/${data.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setRunning(false);
    } finally {
      clearInterval(timer);
    }
  }

  if (running) {
    return (
      <div className="flex flex-col items-center py-12 text-center" role="status" aria-live="polite">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Sparkles className="size-6 animate-pulse" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-foreground">Analyzing your match</h2>
        <p className="text-sm text-muted-foreground">{STAGES[stage]}</p>
        <p className="mt-4 text-xs text-muted-foreground/60">This usually takes 15–40 seconds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Picker label="1. Choose a resume" options={resumes} value={resumeId} onChange={setResumeId} />
      <Picker label="2. Choose a job description" options={jobs} value={jobId} onChange={setJobId} />

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button size="lg" className="w-full" disabled={!resumeId || !jobId} onClick={run}>
        <Sparkles className="size-4" /> Run analysis
      </Button>
    </div>
  );
}
