"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import Core from "smooothy";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import {
  BLOG_MARQUEE_CARDS,
  BLOG_MARQUEE_BONUS_CARDS,
  type BlogMarqueeCard,
} from "@/data/blog-marquee-data";
import { CardFace, CARD_TONES } from "./card-face";

// Rendered sequence: real cards, then the bonus/outro pair — but only the
// real count drives the release math below. See ALL_CARDS' own comment
// for why the two lists stay separate exports in the data file instead of
// being pre-merged there.
const ALL_CARDS: BlogMarqueeCard[] = [
  ...BLOG_MARQUEE_CARDS,
  ...BLOG_MARQUEE_BONUS_CARDS,
];

const LAST_REAL_CARD_INDEX = BLOG_MARQUEE_CARDS.length - 1;

// --- Scroll-to-marquee tuning --------------------------------------------
// Bounded, non-looping sequence, matching the reference's own
// infinite: false config — scroll is the *only* way to move through it
// (drag was removed, see AnimatedMarquee's doc comment), so both the pace
// and the total scroll budget reserved for this slide (consumed by
// PinnedTrack via app/page.tsx) are derived from the same numbers below
// rather than picked independently and left to drift out of sync with
// each other.

// How many px the marquee advances per px of raw page scroll while pinned.
// 1:1 (an earlier value) meant a single normal wheel tick (~300-500px)
// could skip past more than one card's width in a single jump — confirmed
// too fast/jumpy. 0.5 means a wheel tick moves at most about half a card,
// so a card is never skipped by one input event.
const SCROLL_TO_TARGET_SCALE = 0.5;

// Fallback used only for the very first paint, before AnimatedMarquee has
// ever laid out and measured a real card — see getRequiredExitDistancePx's
// own comment for why the *real* measurement (read from the DOM once
// mounted) replaces this immediately after, instead of this staying the
// permanent source of truth. This used to be the *only* number driving the
// pin's reserved distance — sized off an assumed 330px card width, which
// silently went stale every time the card's actual rendered size changed
// (e.g. the sizing fix restoring cards to their original, much larger
// on-screen footprint) without this constant being updated to match,
// quietly under- or over-reserving scroll distance relative to what the
// real cards on screen actually needed. That mismatch — not any one bad
// number — is why the release point kept flip-flopping across rounds.
const FALLBACK_CARD_UNIT_PX = 330 + 16;

// Fallback used only for the server-rendered / first-paint value of the
// reserved pin distance, before a real viewport height is known.
const ASSUMED_VIEWPORT_HEIGHT_PX = 900;

// Extra distance reserved *after* card 7 (the last real card) reaches
// focus, sized in whole "card units" (one real card's width + gap) so it
// scales with whatever the real card size turns out to be, instead of a
// fixed px guess. One unit is exactly enough room for card 7's own peel to
// finish (ratio reaches 1) with card 8 landing flat at its own arrival
// point right as that happens, and card 9 queued just behind it — see
// AnimatedMarquee's doc comment for the full geometry. Cards 8-9 do not
// get their own additional buffer units; they ride entirely within this
// one.
const BUFFER_UNITS = 1;

function requiredExitDistancePx(cardUnitPx: number): number {
  return (BLOG_MARQUEE_CARDS.length - 1 + BUFFER_UNITS) * cardUnitPx;
}

/** Converts a px distance of `target` movement into the vh of raw page
 * scroll needed to produce it, given SCROLL_TO_TARGET_SCALE and a real
 * viewport height. */
function pxToPinVh(px: number, viewportHeightPx: number): number {
  return Math.ceil(px / SCROLL_TO_TARGET_SCALE / (viewportHeightPx / 100));
}

/**
 * Scroll distance (vh) PinnedTrack should reserve for this slide, using the
 * fallback card-unit estimate — only ever used for the SSR / first-paint
 * render, before AnimatedMarquee has measured the real cards. Once real
 * measurement lands (see `onMeasuredExitPx` below), callers should switch
 * to `pxToPinVh(measuredPx, viewportHeightPx)` instead — this function
 * alone is not enough to trust as "the" reserved distance, precisely
 * because it's an estimate rather than a measurement, and estimates are
 * what caused the release-timing regressions in the first place. It's
 * still a real, generous upper bound in practice (this is also the ceiling
 * PinnedTrack falls back on if a real card's exit ratio somehow never
 * reaches 1) — it's just no longer the thing that decides *when* release
 * actually fires.
 */
export function getBlogMarqueePinVh(viewportHeightPx: number): number {
  return pxToPinVh(
    requiredExitDistancePx(FALLBACK_CARD_UNIT_PX),
    viewportHeightPx
  );
}

export const BLOG_MARQUEE_PIN_VH = getBlogMarqueePinVh(
  ASSUMED_VIEWPORT_HEIGHT_PX
);

/**
 * Given the real measured width of one card (in px) and the real measured
 * gap between cards, returns the exact px of `target` movement PinnedTrack
 * should reserve — used once AnimatedMarquee reports real geometry via
 * `onMeasuredExitPx`, replacing the FALLBACK_CARD_UNIT_PX guess above with
 * an actual measurement of whatever the cards render at, at this specific
 * viewport/container width, today.
 */
export function requiredExitPxFromMeasurement(
  cardWidthPx: number,
  gapPx: number
): number {
  return requiredExitDistancePx(cardWidthPx + gapPx);
}

export { pxToPinVh };

/**
 * How long (ms) to genuinely pause the site's Lenis scroll driver once the
 * real last card's exit is measured complete — passed to PinnedTrack as
 * `pinPauseMs`. Two scroll-*distance*-based dwell buffers were tried here
 * first and both failed against real usage: reserving a chunk of extra
 * scroll after the release point (rather than pausing time) can only ever
 * guarantee a minimum number of *pixels* between "cards 8-9 appear" and
 * "the handoff carries them away," never a minimum amount of *time* — a
 * fast trackpad/momentum scroll gesture can blow through any fixed pixel
 * budget in a single motion, between one rendered frame and the next,
 * regardless of how generous that budget is. See PinnedTrack's own doc
 * comment on `pinPauseMs` for the actual mechanism (stopping Lenis itself,
 * not a bigger buffer).
 */
export const BLOG_MARQUEE_PIN_PAUSE_MS = 600;

/**
 * Reduced-motion / no-JS-loop fallback: a plain static grid, zero motion.
 * Includes the bonus cards — there's no lock/release mechanic to protect
 * on this path (HorizontalScrollHome skips PinnedTrack under reduced
 * motion entirely, plain stacked scroll instead), so there's no reason to
 * hide them here; someone with reduced motion on shouldn't miss the joke.
 */
function StaticGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ALL_CARDS.map((card, index) => (
        <div
          key={card.id}
          className="flex flex-col rounded-2xl p-6"
          style={{
            backgroundColor: CARD_TONES[index % CARD_TONES.length],
            border: "1px solid var(--line-strong)",
          }}
        >
          <CardFace card={card} number={String(index + 1).padStart(2, "0")} />
        </div>
      ))}
    </div>
  );
}

/**
 * The actual marquee: smooothy's `Core` drives a scroll position that this
 * component sets directly — Core's own pointer-drag handling is disabled
 * (`slider.paused = true`, right after construction) so scrolling while
 * this slide is pinned is the *only* way to move through the cards.
 * Dragging was removed outright rather than left as an alternate input:
 * confirmed via recording that it let cards fly through far faster than
 * scroll-driven movement ever would, which defeats the "deliberate,
 * readable pace" goal scroll sensitivity is tuned for above. `slider.update()`
 * still runs every frame regardless — `paused` only gates Core's own input
 * handlers, not its render pipeline.
 *
 * Bounded, non-looping (`infinite: false`, matching the reference's own
 * config) — an earlier round added `infinite: true` plus manual
 * `symmetricMod`-based wraparound specifically to support an ambient
 * auto-drift loop that has since been removed entirely. With no drift and
 * no drag, there's nothing left that needs the marquee to loop forever.
 *
 * The reference's own onUpdate reads raw DOM `offsetLeft` directly (not
 * Core's internal itemOffsets, which ignore flex `gap`) and its own
 * static, ascending `z-index: i + 1` — both reproduced as-is here. That
 * static z-index is what makes an exiting card render *behind* whichever
 * card is currently in focus (higher index = arrived more recently =
 * higher z, and cards only ever exit in ascending index order in a
 * bounded, one-directional sequence). A fully-exited card (ratio 1) also
 * now fades to opacity 0 over the tail of its own peel (see FADE_START_RATIO
 * below) — confirmed via screenshot that, without this, a rotated card
 * parked at ratio 1 can still show a thin sliver of its own rotated corner
 * poking out past whatever's currently covering it. Fading it out is a
 * more robust fix than trying to get the exact z-index/overflow geometry
 * to guarantee full coverage at every size — once a card is fully retired
 * it should actually be gone, not just mostly-hidden.
 *
 * `current` is forced equal to `target` the instant `target` changes
 * (right in the pinScrollVh subscription below), instead of letting Core's
 * own built-in exponential lerp (`lerpFactor: 0.02`) chase it over
 * subsequent frames. Core's lerp is real, independent smoothing *on top
 * of* Lenis's own already-smoothed scroll — during sustained fast
 * scrolling, that second layer of smoothing trails `target` by an amount
 * that grows with scroll speed, which is exactly the kind of
 * speed-dependent slop that made the release point (tied to *this* card
 * reaching ratio 1) land at a different real scroll position depending on
 * how fast the gesture was, even though the reserved vh budget was fixed.
 * Forcing current = target makes the rendered card position a pure,
 * instantaneous function of scroll progress — the same input always
 * produces the same ratio, at any scroll speed, which is what makes it
 * possible to gate the pin's release directly on the real measured ratio
 * (see PinnedTrack) instead of a distance estimate.
 *
 * `onExitRatio`, if provided, is written every frame with the real,
 * measured exit ratio (0-1) of the last *real* card (index
 * LAST_REAL_CARD_INDEX) — this is the actual animation-state signal
 * PinnedTrack gates its hard release on, not a scroll-percentage estimate.
 * What actually happens to cards 8-9 given this: since every card shares
 * one `target` offset, card 7 finishing its own exit necessarily means
 * `target` has moved almost exactly one more card-width past card 7's
 * arrival — which lands card 8 right around its own arrival point (flat,
 * `slideLeft` ≈ 0) at that same instant, with card 9 queued just behind
 * it, both fully visible and unrotated. This requires the marquee's own
 * visible window (the `overflow-hidden` box below) to actually be wide
 * enough to show two cards side by side at that instant — which is the
 * reason card size is driven off `cqw` (this box's own rendered width) and
 * not `vw` (raw viewport width): this box is only ever a fraction of the
 * viewport (it shares a grid row with the text column next to it), so
 * sizing cards off the *viewport* let them outgrow the box itself at
 * ordinary, common screen widths well above any mobile breakpoint —
 * confirmed via Playwright that card 9 sat past the box's own right edge,
 * clipped by its `overflow-hidden`, at every tested width from 1000px up
 * to 1366px, only clearing it at 1600px+. `cqw` ties card size to the
 * box's *actual* width instead, so "two cards fit" is true by construction
 * at any width, not just the ones happened to be tested.
 *
 * `onMeasuredExitPx`, if provided, is called once after this marquee's
 * real cards have laid out, with the exact px of `target` movement needed
 * for the last real card to reach ratio 1 (plus one buffer card-unit) —
 * measured directly from `offsetLeft`/`offsetWidth` on the real DOM nodes,
 * not derived from any hardcoded card-size assumption. The caller
 * (app/page.tsx) uses this to size PinnedTrack's reserved pin distance
 * exactly, instead of trusting FALLBACK_CARD_UNIT_PX to still be accurate.
 */
function AnimatedMarquee({
  pinScrollVh,
  onExitRatio,
  onMeasuredExitPx,
}: {
  pinScrollVh?: MotionValue<number>;
  onExitRatio?: MotionValue<number>;
  onMeasuredExitPx?: (px: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const slides = [...wrapper.children] as HTMLElement[];
    const FADE_START_RATIO = 0.82;

    if (onMeasuredExitPx && slides[LAST_REAL_CARD_INDEX]) {
      const lastReal = slides[LAST_REAL_CARD_INDEX];
      const gapPx =
        slides.length > 1
          ? slides[1].offsetLeft - slides[0].offsetLeft - slides[0].offsetWidth
          : 16;
      const requiredPx = requiredExitPxFromMeasurement(
        lastReal.offsetWidth,
        gapPx
      );
      onMeasuredExitPx(requiredPx);
    }

    const slider = new Core(wrapper, {
      infinite: false,
      snap: false,
      variableWidth: true,
      lerpFactor: 0.02,
      speedDecay: 0.97,
      onUpdate: (instance) => {
        const exitBoost = window.innerWidth * 0.1;

        slides.forEach((slide, i) => {
          const slideWidth = slide.offsetWidth;
          const slideLeft = slide.offsetLeft + instance.current;
          const tone = CARD_TONES[i % CARD_TONES.length];
          const zIndex = i + 1;

          if (slideLeft < 0) {
            const ratio = Math.min(1, Math.abs(slideLeft) / slideWidth);
            if (i === LAST_REAL_CARD_INDEX) onExitRatio?.set(ratio);
            const opacity =
              ratio <= FADE_START_RATIO
                ? 1
                : 1 - (ratio - FADE_START_RATIO) / (1 - FADE_START_RATIO);
            slide.style.cssText = `
              background-color: ${tone};
              border: 1px solid var(--line-strong);
              transform-origin: left 80%;
              transform: translateX(${instance.current + Math.abs(slideLeft) + ratio * exitBoost}px) rotate(${-15 * ratio}deg) scale(${1 - ratio * 0.4});
              opacity: ${opacity};
              position: relative;
              z-index: ${zIndex};
            `;
          } else {
            if (i === LAST_REAL_CARD_INDEX) onExitRatio?.set(0);
            slide.style.cssText = `
              background-color: ${tone};
              border: 1px solid var(--line-strong);
              transform: translateX(${instance.current}px);
              position: relative;
              z-index: ${zIndex};
            `;
          }
        });
      },
    });

    // Disables Core's own mousedown/touchstart drag handling and its
    // (unused here anyway) wheel input — everything that actually moves
    // `target` now goes through the pinScrollVh subscription below. Core
    // still sets `cursor: grab` unconditionally in its constructor;
    // reset it so the marquee doesn't visually invite a drag that no
    // longer does anything.
    slider.paused = true;
    wrapper.style.cursor = "";

    let animId: number;

    // Scroll-driven scrub: `pinScrollVh` only changes while the user is
    // actively scrolling through the pin's hold window (PinnedTrack clamps
    // it flat at 0 before that and flat at its ceiling after release), so
    // this fires purely off genuine input — never a timer. Each vh of
    // scroll consumed nudges `target` by the same fraction of a pixel (see
    // SCROLL_TO_TARGET_SCALE), and `current` is snapped to match `target`
    // immediately (see AnimatedMarquee's own doc comment for why) — no
    // added momentum, no lag: stopping mid-scroll stops the cards
    // immediately, per spec.
    let lastPinVh = pinScrollVh?.get() ?? 0;
    const unsubscribePinScroll = pinScrollVh?.on("change", (latest) => {
      const deltaVh = latest - lastPinVh;
      lastPinVh = latest;
      if (deltaVh === 0) return;
      const deltaPx = deltaVh * (window.innerHeight / 100);
      slider.target -= deltaPx * SCROLL_TO_TARGET_SCALE;
      slider.current = slider.target;
    });

    function animate() {
      slider.update();
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      unsubscribePinScroll?.();
      slider.destroy();
    };
  }, [pinScrollVh, onExitRatio, onMeasuredExitPx]);

  return (
    <div className="w-full [container-type:inline-size]">
      <div className="relative isolate h-[64cqw] w-full overflow-hidden">
        <div
          ref={wrapperRef}
          className="flex h-full items-center gap-4 will-change-transform"
        >
          {ALL_CARDS.map((card, index) => (
            <div
              key={card.id}
              className="pointer-events-none flex h-full w-[48cqw] shrink-0 flex-col rounded-2xl p-6"
              style={{
                backgroundColor: CARD_TONES[index % CARD_TONES.length],
                border: "1px solid var(--line-strong)",
              }}
            >
              <CardFace
                card={card}
                number={String(index + 1).padStart(2, "0")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the static grid on both server and first client paint (never a
 * structural hydration mismatch — same SSR-safe pattern as DraggablePhoto
 * and PinnedReveal), upgrading to the animated marquee only after a client
 * effect confirms the user hasn't asked for reduced motion.
 */
export function BlogMarquee({
  pinScrollVh,
  exitRatio,
  onMeasuredExitPx,
}: {
  /** Forwarded to the animated variant — see AnimatedMarquee's doc
   * comment. Unused (and irrelevant) on the static-grid reduced-motion
   * path, which never runs any animation loop to drive in the first
   * place. */
  pinScrollVh?: MotionValue<number>;
  /** Written every frame with the real measured exit ratio of the last
   * real card — see AnimatedMarquee's doc comment. */
  exitRatio?: MotionValue<number>;
  /** Called once with the real measured px distance needed for the last
   * real card's exit — see AnimatedMarquee's doc comment. */
  onMeasuredExitPx?: (px: number) => void;
}) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"static" | "animated">("static");

  useEffect(() => {
    setMode(reduced ? "static" : "animated");
  }, [reduced]);

  return mode === "animated" ? (
    <AnimatedMarquee
      pinScrollVh={pinScrollVh}
      onExitRatio={exitRatio}
      onMeasuredExitPx={onMeasuredExitPx}
    />
  ) : (
    <StaticGrid />
  );
}
