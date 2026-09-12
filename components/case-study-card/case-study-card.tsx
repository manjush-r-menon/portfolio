"use client";

import { useEffect, useRef } from "react";
import { gsap, motionEaseOut } from "@/utils/gsap-init";
import { useReducedMotion } from "@/utils/use-reduced-motion";
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
  // `reduced` starts false on both server and client's first render and
  // only corrects itself a tick later (see useReducedMotion) — the
  // IntersectionObserver callback below fires well after that on any
  // card that isn't already on screen at load, so it must read the
  // *current* value through a ref, not the value closed over when the
  // effect below first ran, or a real reduced-motion visitor could get
  // the stale pre-correction (non-reduced) duration. Same pattern as
  // SmoothScrollProvider's lenisRef / BloomPanel's isOpenRef.
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Gated on `animate` only — a static prop supplied by the caller,
    // identical on server and client — NOT on `reduced`. Conditioning the
    // observer/initial style itself on `reduced` bakes a different value
    // into this statically prerendered page's SSR output (built with no
    // `window`, so it can't know a given visitor's real preference) than
    // what a reduced-motion visitor's client render resolves to; since the
    // initial style only ever applies once, at that first mismatched
    // commit, the card was left permanently stuck at opacity: 0 with
    // nothing left to animate it back (confirmed via Playwright, back when
    // this was a framer-motion `initial` prop — same risk here). Varying
    // only the GSAP tween's duration below sidesteps that: a reduced-motion
    // visitor still reaches opacity 1, via an instant snap instead of a
    // fade, rather than never reaching it (same fix as the Home page's
    // mobile panel reveals).
    if (!animate || !ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: reducedRef.current ? 0 : 0.5,
          ease: motionEaseOut,
          // Framer Motion clears a settled transform to literal "none"
          // rather than a resolved identity matrix — GSAP leaves
          // `translate(0px, 0px)` behind otherwise, which (unlike "none")
          // creates a new CSS containing block for any `position: fixed`
          // descendant and silently resizes it against this card instead
          // of the viewport. Nothing currently nests a fixed-position
          // element under a card, but see page-settle.tsx's own comment
          // for the exact real bug this caused there — matching
          // framer-motion's at-rest DOM state exactly here too, rather
          // than relying on no card ever needing this.
          clearProps: "transform",
        });
        observer.disconnect();
      },
      // Framer Motion's `viewport={{ amount: 0.2 }}` passes `amount`
      // straight through as the native IntersectionObserver `threshold`
      // (see framer-motion's inView()/useInView() source) — this is the
      // exact same mechanism, not an approximation of it.
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  return (
    <article
      ref={ref}
      className="grid grid-cols-1 gap-4 border-t border-line py-10 last:border-b md:grid-cols-[56px_1fr] md:gap-10"
      style={
        animate
          ? { opacity: 0, transform: "translateY(20px)" }
          : undefined
      }
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
    </article>
  );
}
