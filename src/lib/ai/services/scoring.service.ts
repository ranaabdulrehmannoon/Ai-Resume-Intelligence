import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";
import type { SkillMatchResult } from "./skill-matching.service";
import { SCORE_WEIGHTS, TOTAL_POSSIBLE_SCORE } from "../scoring/weights";

export interface ScoreExplanation {
  dimension: keyof typeof SCORE_WEIGHTS;
  score: number;
  max: number;
  explanation: string;
}

export interface ATSScoreResult {
  overallScore: number;
  maxScore: number;
  skillScore: number;
  experienceScore: number;
  keywordScore: number;
  projectScore: number;
  educationScore: number;
  structureScore: number;
  formattingScore: number;
  explanations: ScoreExplanation[];
  estimatedYears: number;
  requiredYears: number;
}

/**
 * Fully deterministic — same (resume, job, matchResult) input always
 * produces the same score. The AI layer never sees or influences this
 * calculation; it only supplies the *inputs* (structured extraction,
 * skill match result) that this service turns into numbers.
 */
export class ScoringService {
  score(resume: StructuredResume, job: StructuredJob, matchResult: SkillMatchResult): ATSScoreResult {
    const skill = this.scoreSkills(job, matchResult);
    const experience = this.scoreExperience(resume, job);
    const keywords = this.scoreKeywords(resume, job);
    const projects = this.scoreProjects(resume, job);
    const education = this.scoreEducation(resume);
    const structure = this.scoreStructure(resume);
    const formatting = this.scoreFormatting(resume);

    const explanations: ScoreExplanation[] = [skill, experience, keywords, projects, education, structure, formatting];
    const overallScore = explanations.reduce((sum, e) => sum + e.score, 0);

    return {
      overallScore,
      maxScore: TOTAL_POSSIBLE_SCORE,
      skillScore: skill.score,
      experienceScore: experience.score,
      keywordScore: keywords.score,
      projectScore: projects.score,
      educationScore: education.score,
      structureScore: structure.score,
      formattingScore: formatting.score,
      explanations,
      estimatedYears: estimateYearsOfExperience(resume),
      requiredYears: job.experienceYears,
    };
  }

  private scoreSkills(job: StructuredJob, match: SkillMatchResult): ScoreExplanation {
    const requiredTotal = Math.max(job.requiredSkills.length, 1);
    const preferredTotal = Math.max(job.preferredSkills.length, 1);

    const requiredMatched = match.matched.filter((m) => m.tier === "required").length;
    const requiredWeak = match.weak.filter((m) => m.tier === "required").length;
    const preferredMatched = match.matched.filter((m) => m.tier === "preferred").length;

    // Weak/semantic matches count for partial (55%) credit — they're real
    // signal, just not as strong as an exact keyword hit.
    const requiredRatio = (requiredMatched + requiredWeak * 0.55) / requiredTotal;
    const preferredRatio = preferredMatched / preferredTotal;

    const raw = requiredRatio * 0.75 + preferredRatio * 0.25;
    const score = Math.round(clamp01(raw) * SCORE_WEIGHTS.skill);

    return {
      dimension: "skill",
      score,
      max: SCORE_WEIGHTS.skill,
      explanation: `${requiredMatched}/${job.requiredSkills.length} required skills matched exactly, ${requiredWeak} matched contextually, ${preferredMatched}/${job.preferredSkills.length} preferred skills matched.`,
    };
  }

  private scoreExperience(resume: StructuredResume, job: StructuredJob): ScoreExplanation {
    const estimatedYears = estimateYearsOfExperience(resume);
    const requiredYears = job.experienceYears;

    let score: number;
    let explanation: string;

    if (requiredYears === 0) {
      score = resume.experience.length > 0 ? Math.round(SCORE_WEIGHTS.experience * 0.85) : Math.round(SCORE_WEIGHTS.experience * 0.5);
      explanation = `No explicit experience requirement stated. Candidate has ${resume.experience.length} listed position(s).`;
    } else {
      const ratio = Math.min(estimatedYears / requiredYears, 1.1);
      score = Math.round(clamp01(ratio) * SCORE_WEIGHTS.experience);
      explanation = `Estimated ${estimatedYears.toFixed(1)} years of experience against a ${requiredYears}-year requirement.`;
    }

    return { dimension: "experience", score, max: SCORE_WEIGHTS.experience, explanation };
  }

  private scoreKeywords(resume: StructuredResume, job: StructuredJob): ScoreExplanation {
    const keywordSet = new Set(
      [...job.keywords, ...job.requiredSkills, ...job.technologies, ...job.preferredSkills]
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean)
    );
    const resumeText = buildResumeSearchText(resume).toLowerCase();

    const hits = [...keywordSet].filter((k) => resumeText.includes(k)).length;
    const total = Math.max(keywordSet.size, 1);
    const score = Math.round(clamp01(hits / total) * SCORE_WEIGHTS.keywords);

    return {
      dimension: "keywords",
      score,
      max: SCORE_WEIGHTS.keywords,
      explanation: `${hits}/${keywordSet.size} job-description keywords found in the resume text.`,
    };
  }

  private scoreProjects(resume: StructuredResume, job: StructuredJob): ScoreExplanation {
    const jobTech = new Set(
      [...job.technologies, ...job.requiredSkills].map((t) => t.toLowerCase())
    );
    const relevantWords = [...jobTech].flatMap((t) => t.split(/\s+/)).filter((w) => w.length > 3);

    let relevantCount = 0;
    for (const project of resume.projects) {
      const text = `${project.description} ${project.technologies.join(" ")}`.toLowerCase();
      if (relevantWords.some((w) => text.includes(w))) relevantCount++;
    }

    const baseline = Math.min(resume.projects.length * 3, 7);
    const bonus = Math.min(relevantCount, 3);
    const score = Math.min(baseline + bonus, SCORE_WEIGHTS.projects);

    return {
      dimension: "projects",
      score,
      max: SCORE_WEIGHTS.projects,
      explanation: `${resume.projects.length} project(s) listed, ${relevantCount} directly relevant to this job's technologies.`,
    };
  }

  private scoreEducation(resume: StructuredResume): ScoreExplanation {
    if (resume.education.length === 0) {
      return {
        dimension: "education",
        score: Math.round(SCORE_WEIGHTS.education * 0.4),
        max: SCORE_WEIGHTS.education,
        explanation: "No education entries found on the resume.",
      };
    }

    const text = JSON.stringify(resume.education).toLowerCase();
    let score = Math.round(SCORE_WEIGHTS.education * 0.8);
    if (/master|m\.s\.?|mba/.test(text)) score = SCORE_WEIGHTS.education;
    else if (/bachelor|b\.s\.?|b\.e\.?|b\.a\.?/.test(text)) score = Math.round(SCORE_WEIGHTS.education * 0.9);

    return {
      dimension: "education",
      score,
      max: SCORE_WEIGHTS.education,
      explanation: `${resume.education.length} education entry/entries found (${resume.education[0]?.degree || "degree unspecified"}).`,
    };
  }

  private scoreStructure(resume: StructuredResume): ScoreExplanation {
    let points = 0;
    const present: string[] = [];

    if (resume.candidate.name) { points++; present.push("name"); }
    if (resume.candidate.email) { points++; present.push("email"); }
    if (resume.candidate.linkedin || resume.candidate.github) { points++; present.push("professional link"); }
    if (resume.summary.length > 20) { points += 2; present.push("summary"); }
    if (resume.skills.length >= 5) { points += 2; present.push("skills section"); }
    if (resume.experience.length > 0) { points++; present.push("experience"); }
    if (resume.education.length > 0) { points++; present.push("education"); }
    if (resume.projects.length > 0) { points++; present.push("projects"); }

    const score = Math.min(points, SCORE_WEIGHTS.structure);

    return {
      dimension: "structure",
      score,
      max: SCORE_WEIGHTS.structure,
      explanation: `Resume includes: ${present.join(", ") || "minimal identifiable sections"}.`,
    };
  }

  private scoreFormatting(resume: StructuredResume): ScoreExplanation {
    // NOTE: true formatting analysis (font consistency, margins, single-
    // vs-multi-column layout) requires the original PDF/DOCX layout,
    // not the extracted text this service receives. This is a
    // conservative structural proxy — see Phase 2 report for the
    // documented limitation and how to extend it with real layout data.
    const bulletCount = resume.experience.reduce((sum, e) => sum + e.description.length, 0);
    const hasConsistentBullets = resume.experience.every((e) => e.description.length > 0);

    const score =
      bulletCount >= 4 && hasConsistentBullets
        ? SCORE_WEIGHTS.formatting
        : Math.round(SCORE_WEIGHTS.formatting * 0.6);

    return {
      dimension: "formatting",
      score,
      max: SCORE_WEIGHTS.formatting,
      explanation: hasConsistentBullets
        ? "Experience entries consistently use bullet-point descriptions."
        : "Some experience entries are missing bullet-point descriptions.",
    };
  }
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function estimateYearsOfExperience(resume: StructuredResume): number {
  let totalMonths = 0;
  let matchedAny = false;

  for (const entry of resume.experience) {
    const start = parseYear(entry.startDate);
    const end = /present/i.test(entry.endDate) || !entry.endDate ? new Date().getFullYear() : parseYear(entry.endDate);
    if (start && end && end >= start) {
      totalMonths += (end - start) * 12;
      matchedAny = true;
    }
  }

  if (matchedAny) return Math.round((totalMonths / 12) * 10) / 10;
  // Fallback heuristic when dates can't be parsed at all.
  return resume.experience.length * 1.5;
}

function parseYear(dateStr: string): number | null {
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
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
