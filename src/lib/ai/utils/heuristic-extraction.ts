/**
 * Naive, dependency-free text heuristics used ONLY by MockProvider to
 * synthesize plausible extraction output from real input text without
 * calling any model. This intentionally does not need to be "smart" —
 * it exists so mock mode still reflects the actual resume/job pasted in
 * (rather than being 100% static canned data), which makes downstream
 * skill-matching/scoring meaningfully testable in mock mode.
 */

const KNOWN_SKILLS = [
  "Python", "TypeScript", "JavaScript", "SQL", "Go", "Java", "C++", "Rust",
  "React", "Next.js", "Vue", "Angular", "Tailwind CSS", "Framer Motion",
  "FastAPI", "Django", "Flask", "Node.js", "Express", "GraphQL",
  "REST API", "WebSockets", "gRPC",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "pgvector",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
  "GitHub Actions", "CI/CD", "Jenkins",
  "OpenAI API", "LangChain", "RAG", "Prompt Engineering", "Embeddings",
  "Machine Learning", "TensorFlow", "PyTorch",
];

export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
}

export function extractEmail(text: string): string {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match?.[0] ?? "";
}

export function extractPhone(text: string): string {
  const match = text.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  return match?.[0] ?? "";
}

export function extractFirstLine(text: string): string {
  return text.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
}

export function extractLinkedIn(text: string): string {
  const match = text.match(/linkedin\.com\/in\/[\w-]+/i);
  return match?.[0] ?? "";
}

export function extractGithub(text: string): string {
  const match = text.match(/github\.com\/[\w-]+/i);
  return match?.[0] ?? "";
}

/** Extracts bullet-ish lines (start with -, •, *, or a capital letter action verb pattern). */
export function extractBulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter((l) => l.length > 25 && l.length < 400);
}

/** Very rough "years of experience required" sniff for job postings. */
export function extractRequiredYears(text: string): number {
  const match = text.match(/(\d{1,2})\+?\s*years?/i);
  return match ? Math.min(parseInt(match[1], 10), 20) : 0;
}
