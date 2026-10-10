import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/resume";

const ROWS: { key: keyof ScoreBreakdownType; label: string }[] = [
  { key: "skill", label: "Skill Match" },
  { key: "experience", label: "Experience" },
  { key: "keywords", label: "Keyword Coverage" },
  { key: "projects", label: "Projects" },
  { key: "education", label: "Education" },
  { key: "structure", label: "Structure" },
  { key: "formatting", label: "Formatting" },
];

export function ScoreBreakdown({
  scores,
  maxScores,
}: {
  scores: ScoreBreakdownType;
  maxScores: ScoreBreakdownType;
}) {
  return (
    <div className="space-y-3">
      {ROWS.map((r) => {
        const value = scores[r.key];
        const max = maxScores[r.key];
        const pct = Math.round((value / max) * 100);
        const valueColor = pct >= 80 ? "text-[#10B981]" : pct >= 60 ? "text-muted-foreground" : "text-[#F59E0B]";
        return (
          <div key={r.key} className="flex items-center gap-3.5">
            <div className="w-28 shrink-0 text-[0.8125rem] text-muted-foreground">{r.label}</div>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#8B5CF6] transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className={`w-12 shrink-0 text-right text-[0.8125rem] font-semibold ${valueColor}`}>
              {value}
              <span className="font-normal text-muted-foreground/50">/{max}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
