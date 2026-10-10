import type { AIProvider } from "../providers/types";
import { cosineSimilarity } from "../utils/cosine-similarity";
import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";

export type SkillTier = "required" | "preferred";
export type SkillPriority = "H" | "M";

export interface MatchedSkill {
  skill: string;
  tier: SkillTier;
  matchType: "exact" | "semantic";
  similarity?: number;
}

export interface MissingSkill {
  skill: string;
  tier: SkillTier;
  priority: SkillPriority;
}

export interface SkillMatchResult {
  matched: MatchedSkill[];
  weak: MatchedSkill[];
  missing: MissingSkill[];
}

/** Cosine-similarity floor above which a non-exact match counts as a "weak"/semantic match. */
const SEMANTIC_MATCH_THRESHOLD = 0.3;

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Two-level, fully deterministic skill matching. The AI provider is used
 * ONLY to produce embedding vectors for the semantic layer — it never
 * makes the match/no-match decision itself. Given identical inputs, this
 * always produces identical output, which is what lets ScoringService
 * build a reproducible, explainable ATS score on top of it.
 */
export class SkillMatchingService {
  constructor(private readonly provider: AIProvider) {}

  async match(resume: StructuredResume, job: StructuredJob): Promise<SkillMatchResult> {
    const resumeSkillsNorm = resume.skills.map(normalize);
    const resumeFullText = buildResumeSearchText(resume).toLowerCase();

    const matched: MatchedSkill[] = [];
    const weak: MatchedSkill[] = [];
    const missing: MissingSkill[] = [];

    // Resume text embedding computed once and reused for every skill's
    // semantic comparison, rather than once per skill.
    const resumeEmbedding = await this.provider.embed(resumeFullText);

    const seen = new Set<string>();

    const evaluate = async (skill: string, tier: SkillTier) => {
      const key = normalize(skill);
      if (seen.has(key)) return;
      seen.add(key);

      // Level 1: exact / keyword matching.
      if (this.isExactMatch(key, resumeSkillsNorm, resumeFullText)) {
        matched.push({ skill, tier, matchType: "exact" });
        return;
      }

      // Level 2: semantic embedding matching.
      const skillEmbedding = await this.provider.embed(skill);
      const similarity = cosineSimilarity(skillEmbedding, resumeEmbedding);

      if (similarity >= SEMANTIC_MATCH_THRESHOLD) {
        weak.push({ skill, tier, matchType: "semantic", similarity });
        return;
      }

      missing.push({ skill, tier, priority: tier === "required" ? "H" : "M" });
    };

    for (const skill of job.requiredSkills) await evaluate(skill, "required");
    for (const skill of job.preferredSkills) await evaluate(skill, "preferred");

    return { matched, weak, missing };
  }

  private isExactMatch(normalizedSkill: string, resumeSkillsNorm: string[], resumeFullText: string): boolean {
    // Exact equality against a resume skills-array entry — the strongest
    // possible signal, and immune to substring false positives since
    // it's a full-string comparison, not `.includes()`.
    if (resumeSkillsNorm.includes(normalizedSkill)) return true;

    // Otherwise require a whole-word/phrase boundary match, checked
    // against both the skills array (joined) and the full resume text.
    // Word-boundary regex (rather than `.includes()`) is what prevents
    // "Java" from falsely matching inside "JavaScript".
    const boundaryRegex = new RegExp(`\\b${escapeRegExp(normalizedSkill)}\\b`, "i");
    return boundaryRegex.test(resumeSkillsNorm.join(" , ")) || boundaryRegex.test(resumeFullText);
  }
}

function buildResumeSearchText(r: StructuredResume): string {
  return [
    r.summary,
    r.skills.join(" "),
    r.experience.map((e) => `${e.role} ${e.company} ${e.description.join(" ")} ${e.technologies.join(" ")}`).join(" "),
    r.projects.map((p) => `${p.name} ${p.description} ${p.technologies.join(" ")}`).join(" "),
    r.education.map((e) => `${e.degree} ${e.field} ${e.institution}`).join(" "),
    r.certifications.join(" "),
  ].join(" ");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
