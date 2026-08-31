"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "@/components/smooth-scroll/smooth-scroll-provider";

type PinnedTrackProps = {
  children: React.ReactNode[];
  /**
   * Index of a panel that should hold the track's horizontal position for
   * an extra `pinVh` of scroll distance instead of being carried straight
   * through like the others. Needed for a panel with its own internal,
   * scroll-independent animation (the blog marquee's scroll-driven peel):
   * smooothy's `Core` gates its own per-frame update on an
   * IntersectionObserver-derived `isVisible` flag, which can flicker false
   * while its wrapper is being continuously repositioned by this track's
   * own scroll-linked transform — freezing the cards' rendered transforms
   * mid-flight and reading as "the whole section just slides past as one
   * rigid block, cards never independently move." Holding the panel
   * perfectly still on screen for a stretch removes that flicker outright
   * (nothing is moving, so intersection never has a reason to toggle),
   * letting the marquee's own scroll-driven movement genuinely play out
   * and be seen.
   */
  pinIndex?: number;
  /**
   * Upper-bound scroll distance (vh) reserved for the pinned panel's hold.
   * This is a *safety ceiling*, not the release trigger — see
   * `releaseGateRatio` below for what actually decides when the hold ends.
   * It exists only so (a) there's a concrete number to size the wrapper's
   * CSS height with, and (b) the hold still ends deterministically if
   * `releaseGateRatio` never reaches 1 for some reason. Size it generously
   * (see getBlogMarqueePinVh / requiredExitPxFromMeasurement in
   * blog-marquee.tsx) — an oversized ceiling costs nothing but a little
   * unused tail of the pin's own scroll budget (the hold just releases
   * earlier, off the real ratio, well before the ceiling is ever reached);
   * an undersized one is what caused the actual regression this replaces.
   */
  pinVh?: number;
  /**
   * Written with the current scroll position's progress through the pinned
   * panel's hold window, clamped to [0, pinVh] — 0 before it's reached and
   * held flat at pinVh once released, so it only ever changes while the
   * user is actually scrolling *through* the hold. The pinned panel reads
   * this to drive its own internal content proportionally to genuine
   * scroll input instead of an ambient timer.
   */
  pinScrollVh?: MotionValue<number>;
  /**
   * The actual, non-negotiable release trigger: a MotionValue read as the
   * pinned panel's own measured animation-state progress (0-1) toward
   * "done" — for the blog marquee, the real last card's exit ratio (see
   * BlogMarquee's `exitRatio` prop). The hold releases the moment this
   * reaches 1, *not* at a fixed scroll-distance estimate. Since the value
   * this reads is itself a pure, reversible function of scroll position
   * (see AnimatedMarquee's doc comment on why `current` is snapped to
   * `target` instead of lerped), gating on it live — rather than latching
   * a one-way "seen it" flag — naturally reproduces the same
   * always-symmetric hold behavior described below: scrolling back into
   * the hold drops the ratio back below 1 at (approximately) the same
   * scroll position it crossed 1 going forward, with no bookkeeping
   * needed. If omitted, falls back to the old distance-only ceiling
   * (`pinVh`) as the release trigger.
   */
  releaseGateRatio?: MotionValue<number>;
  /**
   * When set, genuinely pauses the site's shared Lenis scroll driver (via
   * `.stop()`/`.start()`, not just a scroll-distance trick) for this many
   * ms the *first* time the hold's release condition is met, before
   * letting the release/handoff continue. Exists because a
   * scroll-distance-only buffer was tried first here and failed three
   * times running: a fast trackpad/momentum scroll gesture can cover
   * hundreds of pixels between rendered frames, so no reserved distance,
   * however generous, can guarantee a real human actually sees whatever
   * was on screen right at the release point — only a genuine time pause
   * can. Since Lenis drives real `window.scrollY` directly (see
   * SmoothScrollProvider), stopping it freezes `scrollYProgress` itself,
   * which freezes both this track's `x` and `pinScrollVh` together
   * automatically — no separate "cap the marquee earlier than the outer
   * release" mechanism is needed once this exists.
   */
  pinPauseMs?: number;
};

/**
 * A vertically-scrolled wrapper containing a `position: sticky` track. As
 * the user scrolls down through the wrapper normally, the track's
 * horizontal position is driven 1:1 by scroll progress — continuous and
 * reversible, not a snap-to-slide carousel.
 *
 * When `pinIndex` is set, an extra `pinVh` of scroll distance is inserted
 * right after that panel is reached, during which the horizontal position
 * holds flat instead of advancing, until `releaseGateRatio` reports the
 * pinned content's own animation as complete (or, failing that, until the
 * `pinVh` ceiling is reached). This is a pure function of scroll position
 * and the pinned content's own real state — deliberately, matching how the
 * certifications page's own GSAP ScrollTrigger pin (pinned-reveal.tsx)
 * behaves: it re-triggers identically on a backward scroll too, with no
 * "seen it already" bookkeeping. A one-way latch was considered (skip the
 * hold on any later pass) but rejected: making it one-way requires either
 * an eased catch-up animation or an imperative scroll-position correction
 * to avoid a visible jump right at the moment the latch flips, and either
 * adds real complexity/risk for a "nice to have" the brief offered only as
 * an example, not a requirement. The always-symmetric hold is provably
 * jump-free — it never blocks or captures input: scrolling back through
 * this stretch again costs the same fixed, modest extra distance each
 * time, with zero dead time or forced waiting, so it doesn't trap the user
 * in any sense that actually removes their control. (The optional
 * `pinPauseMs` timed hold, below, is the one deliberate exception — see
 * its own doc comment for why scroll distance alone couldn't do the job
 * it does.)
 */
export function PinnedTrack({
  children,
  pinIndex,
  pinVh = 200,
  pinScrollVh,
  releaseGateRatio,
  pinPauseMs,
}: PinnedTrackProps) {
  const count = children.length;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const pauseStateRef = useRef({ armed: true, active: false });
  // Locked in the first time the release condition is met on a forward
  // pass; reset to null as soon as we're back in "not released" territory
  // so a later forward pass re-locks a fresh value. Anchoring the
  // post-release ramp to the *actual* scroll position release happened at
  // (rather than the old fixed `reachVh + pinVh`) means an early release
  // (ratio hit 1 before the ceiling) still ends exactly at `endPercent` by
  // the time scroll reaches the wrapper's own total height, instead of
  // arriving early and sitting flat for the remainder or, worse, jumping.
  const actualReleaseVhRef = useRef<number | null>(null);

  const hasPin =
    pinIndex !== undefined && pinIndex >= 0 && pinIndex < count - 1;

  const baseVh = count * 100;
  // Panels are evenly spaced across (count - 1) transitions, not `count`
  // equal shares — panel k's own horizontal position is -100k/count%, and
  // matching that against the original plain-linear mapping's endpoint
  // (-100(count-1)/count% at full scroll) puts panel k's *reach point* at
  // scroll fraction k/(count-1) of the base (unextended) distance.
  const transitionVh = baseVh / (count - 1);
  const reachVh = hasPin ? (pinIndex as number) * transitionVh : 0;
  const totalVh = hasPin ? baseVh + pinVh : baseVh;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const endPercent = -100 * ((count - 1) / count);
  const reachPercent = hasPin ? (-100 * (pinIndex as number)) / count : 0;
  const reachBarPercent = hasPin ? (reachVh / baseVh) * 100 : 0;

  const x = useMotionValue("0%");
  const barWidth = useMotionValue("0%");

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!hasPin) {
      x.set(`${latest * endPercent}%`);
      barWidth.set(`${latest * 100}%`);
      return;
    }

    const rawVh = latest * totalVh;

    if (rawVh <= reachVh) {
      const t = reachVh > 0 ? rawVh / reachVh : 0;
      x.set(`${t * reachPercent}%`);
      barWidth.set(`${t * reachBarPercent}%`);
      pinScrollVh?.set(0);
      actualReleaseVhRef.current = null;
      pauseStateRef.current.armed = true;
      return;
    }

    const progressPastReach = rawVh - reachVh;
    pinScrollVh?.set(Math.max(0, Math.min(pinVh, progressPastReach)));

    const measuredRatio = releaseGateRatio?.get() ?? 0;
    const ceilingHit = progressPastReach >= pinVh;
    const released = releaseGateRatio ? measuredRatio >= 1 || ceilingHit : ceilingHit;

    if (pinPauseMs && lenis) {
      const state = pauseStateRef.current;
      if (released) {
        if (state.armed && !state.active) {
          state.armed = false;
          state.active = true;
          lenis.stop();
          setTimeout(() => {
            lenis.start();
            state.active = false;
          }, pinPauseMs);
        }
      } else {
        state.armed = true;
      }
    }

    if (!released) {
      x.set(`${reachPercent}%`);
      barWidth.set(`${reachBarPercent}%`);
      actualReleaseVhRef.current = null;
      return;
    }

    if (actualReleaseVhRef.current === null) {
      // Clamped to the theoretical ceiling (reachVh + pinVh), not left as
      // whatever rawVh happens to be right now — those normally coincide
      // (this is usually the first tick where release flips true, which
      // for real, continuous scrolling is always at/just past whichever
      // of "ratio hit 1" or "ceiling reached" fired first). But a single
      // scroll event can legitimately jump straight from before-reach all
      // the way to the wrapper's own scroll end in one tick (a keyboard
      // "End" press, or dragging a scrollbar thumb to the bottom — no
      // Lenis smoothing in between to spread it across frames) — without
      // this clamp, `rawVh` in that one tick could itself already equal
      // `totalVh`, locking a release anchor with zero headroom before the
      // wrapper's own end and permanently freezing `x` at `reachPercent`
      // even though `released` is (correctly) true. The ceiling is always
      // a safe anchor with real headroom (`totalVh - (reachVh + pinVh)`
      // equals a full `transitionVh` share, by construction), and using
      // whichever is smaller only ever gives *more* headroom than the
      // ceiling would, never less — confirmed via a Playwright reproduction
      // that jumped straight from scroll position 0 to the document's own
      // max scrollY in one `scrollTo` call.
      actualReleaseVhRef.current = Math.min(rawVh, reachVh + pinVh);
    }
    const releasedAtVh = actualReleaseVhRef.current;
    const remainingSpan = Math.max(1, totalVh - releasedAtVh);
    const t = Math.max(0, Math.min(1, (rawVh - releasedAtVh) / remainingSpan));
    x.set(`${reachPercent + t * (endPercent - reachPercent)}%`);
    barWidth.set(`${reachBarPercent + t * (100 - reachBarPercent)}%`);
  });

  return (
    <div ref={wrapperRef} style={{ height: `${totalVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-16">
        <motion.div
          className="flex h-full"
          style={{ x, width: `${count * 100}vw` }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex h-full w-screen shrink-0 flex-col justify-center"
            >
              {child}
            </div>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line">
          <motion.div className="h-full bg-ink" style={{ width: barWidth }} />
        </div>
      </div>
    </div>
  );
}
