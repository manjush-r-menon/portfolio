"use client";

import { useEffect, useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import {
  useIsMobileScroll,
  MOBILE_SCROLL_BREAKPOINT,
} from "@/utils/use-is-mobile-scroll";
import { PinnedTrack } from "./pinned-track";

type Panel = {
  key: string;
  content: React.ReactNode;
  /**
   * Content to render on the plain vertical-stack tree instead of
   * `content`, when the two need to differ — currently only the blog
   * marquee panel, whose real desktop content depends on PinnedTrack's own
   * pin mechanics (see app/page.tsx). Falls back to `content` when omitted.
   */
  mobileContent?: React.ReactNode;
};

/**
 * Renders the plain, normally-scrolling stacked layout on both the server
 * and the first client paint (so there is never a structural hydration
 * mismatch), then upgrades to the pinned horizontal track after mount —
 * but only if the user hasn't asked for reduced motion AND the viewport is
 * wide enough for the pin/translate mechanism to make sense. Mobile-width
 * users get the same plain stack reduced-motion users already got,
 * regardless of their motion preference (see MOBILE-SCROLL-PLAN.md — the
 * pin/translate mechanism reads as a confusing tunnel-scroll on a screen
 * too small for the "sideways journey" to land as an intentional spatial
 * device, independent of whether motion itself is wanted).
 */
export function HorizontalScrollHome({
  panels,
  pinIndex,
  pinVh,
  pinScrollVh,
  releaseGateRatio,
  pinPauseMs,
}: {
  panels: Panel[];
  /** Forwarded to PinnedTrack — see its own doc comments. Irrelevant (and
   * unused) on the plain-stack fallback below, which never pins
   * anything at all. */
  pinIndex?: number;
  pinVh?: number;
  pinScrollVh?: MotionValue<number>;
  releaseGateRatio?: MotionValue<number>;
  pinPauseMs?: number;
}) {
  const reduced = useReducedMotion();
  const isMobileScroll = useIsMobileScroll();
  const [usePinned, setUsePinned] = useState(false);

  useEffect(() => {
    // Both `reduced` and `isMobileScroll` are sourced from hooks that start
    // `false` and correct themselves in their own effect one tick later —
    // since effects run children-first, this effect can otherwise fire
    // BEFORE either correction lands, briefly deciding "pinned" for a user
    // who's actually on mobile or has reduced motion on, before
    // self-correcting (same race documented in pinned-reveal.tsx). Reading
    // matchMedia directly here sidesteps the lag; both hook values stay in
    // the dependency array so a live OS-setting toggle or resize/
    // orientation change still re-runs this.
    const prefersReduced =
      reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      isMobileScroll ||
      window.matchMedia(`(max-width: ${MOBILE_SCROLL_BREAKPOINT - 1}px)`)
        .matches;

    setUsePinned(!prefersReduced && !isMobile);
  }, [reduced, isMobileScroll]);

  if (usePinned) {
    return (
      <PinnedTrack
        pinIndex={pinIndex}
        pinVh={pinVh}
        pinScrollVh={pinScrollVh}
        releaseGateRatio={releaseGateRatio}
        pinPauseMs={pinPauseMs}
      >
        {panels.map((panel) => panel.content)}
      </PinnedTrack>
    );
  }

  return (
    <div className="flex flex-col pt-28 pb-20 sm:pt-36 sm:pb-16">
      {panels.map((panel) => (
        <motion.div
          key={panel.key}
          className="flex min-h-screen flex-col justify-center"
          // `initial`/`whileInView` stay unconditional (not gated on
          // `reduced`) deliberately — matching GalleryWall's about-page
          // reveal, not CaseStudyCard's. Gating `initial` itself on
          // `reduced` bakes a different value into the statically
          // prerendered HTML (built with no `window`, so it can never know
          // a given visitor's real preference) than what a reduced-motion
          // visitor's client-side render resolves to — and since `initial`
          // only ever applies once, at that first mismatched commit, the
          // panel is left permanently stuck at opacity 0 with nothing left
          // to animate it back (confirmed via Playwright — this exact
          // failure reproduces today on the already-shipped CaseStudyCard).
          // Keeping `initial`/`whileInView` identical on server and client
          // sidesteps that entirely; only `transition.duration` varies per
          // user, so a reduced-motion visitor still reaches opacity 1 (via
          // an instant, non-animated cut instead of a fade) rather than
          // never reaching it at all.
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        >
          {panel.mobileContent ?? panel.content}
        </motion.div>
      ))}
    </div>
  );
}
