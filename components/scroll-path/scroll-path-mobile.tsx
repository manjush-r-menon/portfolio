import buildingAWebsiteImage from "@/images/about-building-a-website.svg";
import programmingImage from "@/images/about-programming.svg";
import juniorSoccerImage from "@/images/about-junior-soccer.svg";
import codeThinkingImage from "@/images/about-code-thinking.svg";

// Static stand-in for ScrollPath on mobile — no ScrollTrigger, no scrubbed
// SVG line, no per-row reveal, just the same bio copy and illustrations in
// a plain stacked column. See scroll-path.tsx's own doc comment for why
// its scroll-linked line and `lg:flex-row` row geometry don't carry over
// to a stacked mobile layout.
export function ScrollPathMobile() {
  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-2xl bg-line px-8 py-12 text-center">
        <h1 className="font-display text-[clamp(1.75rem,7vw,2.5rem)] leading-[1.15] font-medium text-ink">
          I build things, break things, and dig until I understand why.
        </h1>
      </section>

      <div className="flex flex-col gap-12">
        <img
          src={buildingAWebsiteImage.src}
          alt="Illustration of a person building a website"
          className="aspect-[702.49975/680.4175] w-full object-cover"
        />

        <div className="flex flex-col gap-6">
          <img
            src={programmingImage.src}
            alt="Illustration of a person programming at a desk"
            className="aspect-[800/572.62] w-full object-cover"
          />
          <div className="flex flex-col gap-4 rounded-2xl bg-line p-8">
            <h2 className="font-display text-[clamp(1.375rem,6vw,1.75rem)] leading-tight font-medium text-ink">
              Started with a Web Developer Bootcamp and a lot of confused
              console.logs.
            </h2>
            <p className="font-sans text-base leading-relaxed text-ink-dim">
              Still mostly the same, honestly — just with better error
              messages.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <img
            src={juniorSoccerImage.src}
            alt="Illustration of a young soccer player"
            className="aspect-[856.97376/510.42687] w-full object-cover"
          />
          <div className="flex flex-col gap-4 rounded-2xl bg-line p-8">
            <h2 className="font-display text-[clamp(1.375rem,6vw,1.75rem)] leading-tight font-medium text-ink">
              Outside of code: football on weekends, a camera I&apos;m
              slowly learning to use properly, and a habit of finishing side
              projects about 80% of the way.
            </h2>
          </div>
        </div>

        <img
          src={codeThinkingImage.src}
          alt="Illustration of a person thinking through code"
          className="aspect-[960/417.517] w-full object-cover"
        />
      </div>

      <section className="rounded-2xl bg-line px-8 py-12 text-center">
        <h1 className="font-display text-[clamp(1.75rem,7vw,2.5rem)] leading-[1.15] font-medium text-ink">
          That&apos;s the summary version. What follows is the messier, more
          honest one — a gallery of moments, not milestones.
        </h1>
      </section>
    </div>
  );
}
