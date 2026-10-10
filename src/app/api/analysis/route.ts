import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getAIProvider,
  AnalysisOrchestratorService,
  AIValidationError,
  isAIProviderRateLimitError,
} from "@/lib/ai";

// The pipeline makes 5 model calls (2 extraction + bullets/recs/interview
// in parallel) — comfortably over Vercel's 10s Hobby-tier default. This
// requires at minimum the Pro plan (60s ceiling) to run reliably; see
// README "Deployment" section.
export const maxDuration = 60;

const requestSchema = z.object({
  resumeId: z.string().min(1),
  jobDescriptionId: z.string().min(1),
  /** Skip the duplicate-analysis shortcut and run the pipeline again. */
  force: z.boolean().optional(),
});

/** Cost guard: each analysis makes several model calls, so cap runs per user per hour. */
const MAX_ANALYSES_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { resumeId, jobDescriptionId, force } = parsed.data;
  const userId = session.user.id;

  // Ownership checks — never let one user run (or read) an analysis
  // against another user's resume/job data.
  const [resume, job] = await Promise.all([
    db.resume.findFirst({ where: { id: resumeId, userId } }),
    db.jobDescription.findFirst({ where: { id: jobDescriptionId, userId } }),
  ]);
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  if (!job) return NextResponse.json({ error: "Job description not found" }, { status: 404 });

  // Duplicate-analysis shortcut: resumes and job descriptions are
  // immutable once created, so a completed analysis for the same pair is
  // still valid. Returning it avoids paying for identical model calls
  // and guarantees the same pair always shows the same score.
  if (!force) {
    const existing = await db.analysis.findFirst({
      where: { userId, resumeId, jobDescriptionId, status: "COMPLETE" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ id: existing.id, reused: true }, { status: 200 });
    }
  }

  const recentCount = await db.analysis.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - ONE_HOUR_MS) } },
  });
  if (recentCount >= MAX_ANALYSES_PER_HOUR) {
    return NextResponse.json(
      { error: "You've reached the hourly analysis limit. Please try again later." },
      { status: 429 }
    );
  }

  const analysisRow = await db.analysis.create({
    data: {
      userId,
      resumeId,
      jobDescriptionId,
      status: "PROCESSING",
      totalScore: 0,
      skillScore: 0,
      experienceScore: 0,
      keywordScore: 0,
      projectScore: 0,
      educationScore: 0,
      structureScore: 0,
      formattingScore: 0,
      matchedSkills: [],
      missingSkills: [],
      weakSkills: [],
      bulletAnalysis: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      interviewQuestions: {},
    },
  });

  try {
    const orchestrator = new AnalysisOrchestratorService(getAIProvider());
    const result = await orchestrator.run(resume.rawText, job.rawText);

    // Persist the structured extraction as a ResumeVersion — closes a
    // gap flagged in the Phase 2 report (extraction was validated but
    // never saved). Versioned so re-analyzing later doesn't clobber
    // history; also lets the adapter show the candidate's real name and
    // a real estimated-years figure instead of falling back to the
    // filename.
    const existingVersions = await db.resumeVersion.count({ where: { resumeId } });
    await db.resumeVersion.create({
      data: {
        resumeId,
        version: existingVersions + 1,
        candidate: result.resume.candidate,
        summary: result.resume.summary,
        skills: result.resume.skills,
        experience: result.resume.experience,
        education: result.resume.education,
        projects: result.resume.projects,
        certifications: result.resume.certifications,
        achievements: result.resume.achievements,
      },
    });

    // Also persist the AI's extracted structure back onto the job
    // description row, so future reads (list pages, re-analysis) see
    // real required/preferred skills instead of the empty arrays this
    // row was created with in the /api/jobs route.
    await db.jobDescription.update({
      where: { id: jobDescriptionId },
      data: {
        requiredSkills: result.job.requiredSkills,
        preferredSkills: result.job.preferredSkills,
        responsibilities: result.job.responsibilities,
        qualifications: result.job.qualifications,
        technologies: result.job.technologies,
        keywords: result.job.keywords,
        experienceYears: result.job.experienceYears,
      },
    });

    // Merge the AI's per-skill explanations onto each missing-skill entry
    // at write time, rather than storing `skillExplanations` as a
    // separate array that nothing ever joins back up — found during the
    // Phase 3 audit: this data was being generated and then silently
    // discarded before this fix.
    const explanationBySkill = new Map(
      result.recommendations.skillExplanations.map((e) => [e.skill.toLowerCase(), e])
    );
    const missingSkillsWithContext = result.match.missing.map((m) => {
      const explanation = explanationBySkill.get(m.skill.toLowerCase());
      return {
        ...m,
        whyItMatters: explanation?.whyItMatters ?? "",
        howToDemonstrate: explanation?.howToDemonstrate ?? "",
      };
    });

    const updated = await db.analysis.update({
      where: { id: analysisRow.id },
      data: {
        status: "COMPLETE",
        totalScore: result.scores.overallScore,
        skillScore: result.scores.skillScore,
        experienceScore: result.scores.experienceScore,
        keywordScore: result.scores.keywordScore,
        projectScore: result.scores.projectScore,
        educationScore: result.scores.educationScore,
        structureScore: result.scores.structureScore,
        formattingScore: result.scores.formattingScore,
        matchedSkills: result.match.matched as unknown as Prisma.InputJsonValue,
        missingSkills: missingSkillsWithContext as unknown as Prisma.InputJsonValue,
        weakSkills: result.match.weak as unknown as Prisma.InputJsonValue,
        bulletAnalysis: result.bulletAnalysis.bullets,
        strengths: result.recommendations.strengths,
        weaknesses: result.recommendations.weaknesses,
        recommendations: result.recommendations.recommendations,
        interviewQuestions: result.interviewPrep,
      },
    });

    return NextResponse.json({ id: updated.id, reused: false }, { status: 201 });
  } catch (err) {
    // Never leave an analysis silently stuck in PROCESSING, and never
    // store partial/unvalidated AI output — mark it FAILED with a safe,
    // non-leaky message.
    const rateLimited = isAIProviderRateLimitError(err);
    const message = rateLimited
      ? "The AI provider rate limit has been reached. Please try again later."
      : err instanceof AIValidationError
        ? "The AI response could not be validated after retries."
        : "Analysis failed unexpectedly.";

    await db.analysis.update({
      where: { id: analysisRow.id },
      data: { status: "FAILED", errorMessage: message },
    });

    console.error("Analysis pipeline failed", err);
    return NextResponse.json({ error: message, analysisId: analysisRow.id }, { status: rateLimited ? 429 : 502 });
  }
}
