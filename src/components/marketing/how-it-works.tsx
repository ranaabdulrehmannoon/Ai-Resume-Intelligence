const STEPS = [
  {
    n: "01",
    title: "Upload Your Resume",
    desc: "Paste your resume text. Our AI extracts structure, skills, experience, and achievements with precision.",
  },
  {
    n: "02",
    title: "Add Job Description",
    desc: "Paste the target job posting. We extract required skills, responsibilities, and experience requirements.",
  },
  {
    n: "03",
    title: "AI Analyzes Your Match",
    desc: "Semantic and keyword matching runs across 7 dimensions to produce your explainable ATS score.",
  },
  {
    n: "04",
    title: "Improve & Prepare",
    desc: "Get bullet coaching, ranked recommendations, and personalized interview prep — all specific to you.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            The Process
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            From resume to interview-ready in minutes
          </h2>
          <p className="mt-3.5 text-muted-foreground">
            A rigorous multi-step AI pipeline runs behind every analysis — not a
            single generic LLM call.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          <div className="absolute left-[10%] right-[10%] top-[21px] hidden h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent md:block" />
          {STEPS.map((s) => (
            <div key={s.n} className="px-3 text-center">
              <div className="relative z-10 mx-auto mb-4.5 flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#8B5CF6] text-base font-bold text-white shadow-[0_4px_18px_rgba(99,102,241,0.3)]">
                {s.n}
              </div>
              <div className="mb-2 text-[0.9375rem] font-semibold text-foreground">
                {s.title}
              </div>
              <div className="text-[0.84rem] leading-relaxed text-muted-foreground/70">
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
