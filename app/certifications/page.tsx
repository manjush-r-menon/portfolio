import { certifications } from "@/data/certificate-data/certificate-data";
import { CaseStudyCard } from "@/components/case-study-card/case-study-card";
import { IndexLabel } from "@/components/index-label/index-label";
import type { CaseStudy } from "@/data/case-studies-data";

const CERTIFICATION_STUDIES: CaseStudy[] = certifications.map(
  (certification, index) => ({
    index: String(index + 1).padStart(2, "0"),
    title: certification.title,
    role: `${certification.issuer} — Issued ${certification.date}`,
    description: certification.description,
  })
);

export default function Certifications() {
  return (
    <div className="w-full">
      <IndexLabel index="01" />
      <h1 className="mt-4 flex flex-col">
        <span className="ghost-word-top">Certifications</span>
        <span className="ghost-word-echo">earned</span>
      </h1>

      <p className="mt-8 max-w-xl font-sans text-[15px] leading-[1.7] text-ink-dim sm:text-base">
        Validating expertise through continuous learning and professional
        development.
      </p>

      <div className="mt-16">
        {CERTIFICATION_STUDIES.map((study) => (
          <CaseStudyCard key={study.title} study={study} animate={false} />
        ))}
      </div>

      <p className="mt-12 font-sans text-[15px] text-ink-dim">
        View verified credentials on{" "}
        <a
          href="https://www.linkedin.com/in/manjush-menon/"
          className="rounded-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent-ink hover:decoration-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </p>
    </div>
  );
}
