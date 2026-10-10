const STATS = [
  { value: "12K+", label: "Resumes Analyzed" },
  { value: "94%", label: "Match Accuracy" },
  { value: "7", label: "Scoring Dimensions" },
  { value: "3x", label: "Interview Rate" },
];

export function StatsBar() {
  return (
    <div className="border-y border-white/[0.04] px-6 py-5">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="gradient-text text-[1.75rem] font-extrabold tracking-tight">
              {s.value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground/70">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
