"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IndexLabel } from "@/components/index-label/index-label";
import { ArrowIcon } from "@/components/icon-components/arrow-icon";
import { TagPill } from "@/components/tag-pill/tag-pill";
import type { CaseStudy } from "@/data/case-studies-data";

export function CaseStudyCard({
  study,
  animate = true,
}: {
  study: CaseStudy;
  animate?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className="grid grid-cols-1 gap-4 border-t border-line py-10 last:border-b md:grid-cols-[56px_1fr] md:gap-10"
      // `initial`/`whileInView` are gated on `animate` only — a static prop
      // supplied by the caller, identical on server and client — NOT on
      // `reduced`. Conditioning `initial` itself on `reduced` bakes a
      // different value into this statically prerendered page's SSR output
      // (built with no `window`, so it can't know a given visitor's real
      // preference) than what a reduced-motion visitor's client render
      // resolves to; since `initial` only ever applies once, at that first
      // mismatched commit, the card was left permanently stuck at
      // opacity: 0 with nothing left to animate it back (confirmed via
      // Playwright). Keeping `initial`/`whileInView` unconditional here and
      // varying only `transition.duration` sidesteps that: a reduced-motion
      // visitor still reaches opacity 1, via an instant snap instead of a
      // fade, rather than never reaching it (same fix as the Home page's
      // mobile panel reveals).
      initial={animate ? { opacity: 0, y: 20 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: animate && !reduced ? 0.5 : 0, ease: "easeOut" }}
    >
      <IndexLabel index={study.index} />

      <div>
        <h3 className="grotesk-display text-[clamp(2.25rem,5vw,3.75rem)]">
          {study.title}
        </h3>

        {study.role && (
          <p className="mt-1 font-sans text-sm font-medium text-accent-ink">
            {study.role}
          </p>
        )}

        <p className="mt-4 flex max-w-2xl items-start gap-3 font-sans text-[15px] leading-[1.7] text-ink-dim sm:text-base">
          <ArrowIcon className="mt-1 h-4 w-4 shrink-0 text-accent" />
          <span>{study.description}</span>
        </p>

        {study.tags && (
          <div className="mt-5 flex flex-wrap gap-2">
            {study.tags.map((tag) => (
              <TagPill key={tag}>{tag}</TagPill>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
