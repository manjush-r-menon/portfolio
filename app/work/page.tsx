import type { Metadata } from "next";
import { CaseStudyCard } from "@/components/features/case-study-card/case-study-card";
import { IndexLabel } from "@/components/ui/index-label/index-label";
import { CardRevealSequence } from "@/components/features/card-reveal/card-reveal";
import { CASE_STUDIES } from "@/data/case-studies";

const TITLE = "Work | Manjush Menon";
const DESCRIPTION =
  "Four projects, in the order they happened — what I actually did on each, not just the title on the ticket.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/work",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/twitter-image"],
  },
};

export default function Work() {
  return (
    <div className="w-full">
      <IndexLabel index="01" />
      <h1 className="mt-4 flex flex-col">
        <span className="ghost-word-top">Selected</span>
        <span className="ghost-word-echo">work</span>
      </h1>

      <p className="mt-8 max-w-xl font-sans text-[15px] leading-[1.7] text-ink-dim sm:text-base">
        Four projects, in the order they happened — what I actually did on
        each, not just the title on the ticket.
      </p>

      <div className="mt-16">
        {CASE_STUDIES.map((study) => (
          <CaseStudyCard key={study.title} study={study} />
        ))}
      </div>

      <CardRevealSequence />
    </div>
  );
}
