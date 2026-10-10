import type { AIProvider } from "../providers/types";
import { ResumeExtractionService } from "./resume-extraction.service";
import { JobExtractionService } from "./job-extraction.service";
import { SkillMatchingService } from "./skill-matching.service";
import { ScoringService } from "./scoring.service";
import { BulletAnalysisService } from "./bullet-analysis.service";
import { RecommendationService } from "./recommendation.service";
import { InterviewPreparationService } from "./interview-preparation.service";

import type { StructuredResume } from "../schemas/resume.schema";
import type { StructuredJob } from "../schemas/job.schema";
import type { SkillMatchResult } from "./skill-matching.service";
import type { ATSScoreResult } from "./scoring.service";
import type { BulletAnalysisResponse, RecommendationsResponse, InterviewPrepResponse } from "../schemas/analysis.schema";

export interface FullAnalysisResult {
  resume: StructuredResume;
  job: StructuredJob;
  match: SkillMatchResult;
  scores: ATSScoreResult;
  bulletAnalysis: BulletAnalysisResponse;
  recommendations: RecommendationsResponse;
  interviewPrep: InterviewPrepResponse;
}

/**
 * Wires every service together in the order the master spec's pipeline
 * diagram describes. This is the only place that knows the *order* of
 * operations — each individual service stays independently testable and
 * has no knowledge of the others.
 *
 * Deliberately NOT a singleton / NOT importing `getAIProvider()` itself —
 * the caller injects a provider, so tests can pass a MockProvider (or a
 * hand-built fake) without any env-var juggling.
 */
export class AnalysisOrchestratorService {
  private readonly resumeExtraction: ResumeExtractionService;
  private readonly jobExtraction: JobExtractionService;
  private readonly skillMatching: SkillMatchingService;
  private readonly scoring: ScoringService;
  private readonly bulletAnalysis: BulletAnalysisService;
  private readonly recommendations: RecommendationService;
  private readonly interviewPrep: InterviewPreparationService;

  constructor(provider: AIProvider) {
    this.resumeExtraction = new ResumeExtractionService(provider);
    this.jobExtraction = new JobExtractionService(provider);
    this.skillMatching = new SkillMatchingService(provider);
    this.scoring = new ScoringService();
    this.bulletAnalysis = new BulletAnalysisService(provider);
    this.recommendations = new RecommendationService(provider);
    this.interviewPrep = new InterviewPreparationService(provider);
  }

  /** Full pipeline from raw text to a complete analysis, given resume+job text already extracted from files. */
  async run(resumeRawText: string, jobRawText: string): Promise<FullAnalysisResult> {
    const [resume, job] = await Promise.all([
      this.resumeExtraction.extract(resumeRawText),
      this.jobExtraction.extract(jobRawText),
    ]);

    return this.runFromStructured(resume, job);
  }

  /** Same pipeline, but starting from already-extracted+validated resume/job data (e.g. re-running analysis against a stored ResumeVersion). */
  async runFromStructured(resume: StructuredResume, job: StructuredJob): Promise<FullAnalysisResult> {
    const match = await this.skillMatching.match(resume, job);
    const scores = this.scoring.score(resume, job, match);

    const [bulletAnalysis, recommendations, interviewPrep] = await Promise.all([
      this.bulletAnalysis.analyze(resume, job),
      this.recommendations.generate(resume, job, match, scores),
      this.interviewPrep.generate(resume, job, match),
    ]);

    return { resume, job, match, scores, bulletAnalysis, recommendations, interviewPrep };
  }
}
