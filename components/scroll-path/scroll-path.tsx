"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import buildingAWebsiteImage from "@/images/about-building-a-website.svg";
import programmingImage from "@/images/about-programming.svg";
import juniorSoccerImage from "@/images/about-junior-soccer.svg";
import codeThinkingImage from "@/images/about-code-thinking.svg";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ported from /references/ (index.html + script.js + style.css): a
 * scroll-*linked*, not scroll-*jacked*, SVG path draw. The rows section
 * below is just a naturally tall, normally-scrolling block (stacked rows
 * with big gaps, no `pin: true` anywhere) — the stroke's
 * `strokeDashoffset` is scrubbed directly against how far the user has
 * scrolled through that block (`scrollTrigger: { trigger: rowsRef,
 * start: 'top top', end: 'bottom bottom', scrub: true }`), matching the
 * reference's own mechanism exactly. This is a different mechanic from
 * the certifications deck (components/card-reveal/pinned-reveal.tsx),
 * which genuinely pins — don't reach for that pattern here.
 *
 * The path's own `d`/`viewBox` are the reference's hand-plotted numbers,
 * carried over as-is for this structural pass. They're tuned to the
 * reference's *exact* row heights and gaps (4 rows, 160px/80px gaps,
 * specific card padding) — if this page's real row content ends up a
 * meaningfully different height once real copy/imagery lands, the path
 * will visibly drift from the rows it's meant to track through and will
 * need re-plotting to match. Not a "set once and forget" value.
 *
 * The 4 row illustrations are unDraw "spot illustration" SVGs (classic
 * fixed accent-purple #6c63ff + fixed neutrals style) — the accent purple
 * has been find-and-replaced with #8ecae6 directly in each SVG source file
 * (see /images/about-*.svg), literal hex swap rather than a CSS-variable
 * reference, since these are plain static-imported assets rendered via
 * <img src>, not inlined as JSX — matching how gallery-wall.tsx's own SVG
 * asset is themed (or rather, in this case, isn't: it's a plain <img>, so
 * any recoloring has to happen in the file itself). #8ecae6 is a soft sky
 * blue — deliberately outside the site's --accent/orange family (there's
 * no matching theme token for it), a one-off illustration accent rather
 * than a reusable design-system color, chosen after --accent (#d1591f) →
 * --accent-ink (#5c260c) → a lighten (#7f3512) → --card-1 (#f5e6da, too
 * washed out) all got tried first. Every other unDraw color (skin tones,
 * navy, grays) is left untouched on
 * purpose.
 */
export function ScrollPath() {
  const reduced = useReducedMotion();
  const rowsRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      const rows = rowsRef.current;
      if (!path || !rows) return;

      // Same lag guard as pinned-reveal.tsx: `reduced` starts `false` and
      // corrects itself in its own effect one tick later, which can let
      // this effect fire first and build a real ScrollTrigger for a user
      // who actually has reduced motion on. Reading matchMedia directly
      // here sidesteps that race.
      const prefersReduced =
        reduced ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (prefersReduced) {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
        return;
      }

      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      const tween = gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: rows,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rowsRef, dependencies: [reduced] }
  );

  return (
    // `-mt-28 sm:-mt-36` cancels out <main>'s own top padding (reserved
    // site-wide for its fixed nav — see app/layout.tsx), which otherwise
    // pushes the hero section's top edge down by that amount, making its
    // `h-[100svh]` box run 112–144px past the actual first screenful and
    // vertically centering its text below true viewport-center instead of
    // in it. The hero section adds the exact same amount back as its own
    // internal `pt` below, so its content still clears the fixed nav —
    // the difference is that padding now lives *inside* the 100svh box
    // (border-box sizing) instead of stacking in front of it, so the box
    // itself stays exactly one screen tall. Nothing after the hero needs
    // this treatment: the rows section is deliberately taller than one
    // screen, and the outro isn't first-in-flow, so it was never affected.
    <div className="relative -mx-6 -mt-28 sm:-mx-10 sm:-mt-36 lg:-mx-16 xl:-mx-24">
      <section className="flex h-[100svh] w-full items-center justify-center overflow-hidden bg-line px-8 pt-28 pb-8 sm:pt-36">
        <h1 className="w-full text-center font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.1] font-medium text-ink lg:w-3/5">
          I build things, break things, and dig until I understand why.
        </h1>
      </section>

      <div
        ref={rowsRef}
        // `z-0` (not just `relative`) is load-bearing: `position:relative`
        // alone does *not* establish a stacking context — only `position`
        // combined with an explicit (non-`auto`) `z-index` does. Without
        // it, the path's `z-[-1]` below isn't scoped locally to this div;
        // it gets compared against the nearest ancestor that *does*
        // establish one, which in this tree is effectively the page root —
        // putting the path behind `<body>`'s own opaque `bg-bg`,
        // invisible everywhere rather than just behind the rows' own
        // content. Same class of stacking-context gotcha already
        // documented in card-reveal.module.css (PageSettle's residual
        // inline transform trapping `.servicesHeaderPortal`) — confirmed
        // here via a Playwright reproduction: forcing this div's z-index
        // from `auto` to `0` was the entire fix, no other change needed.
        className="relative z-0 flex w-full flex-col gap-20 overflow-hidden p-8 lg:gap-40"
      >
        {/* Row 1 — full-width image */}
        <div className="flex justify-center">
          <div className="w-full lg:w-1/2">
            <img
              src={buildingAWebsiteImage.src}
              alt="Illustration of a person building a website"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Row 2 — text card, then image */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto flex w-full flex-col gap-4 rounded-2xl bg-line p-12 lg:w-3/4">
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-tight font-medium text-ink">
                Started with a Web Developer Bootcamp and a lot of confused
                console.logs.
              </h2>
              <p className="font-sans text-base leading-relaxed text-ink-dim lg:text-lg">
                Still mostly the same, honestly — just with better error
                messages.
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <img
              src={programmingImage.src}
              alt="Illustration of a person programming at a desk"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Row 3 — image, then text card (order flipped from row 2) */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col justify-center">
            <img
              src={juniorSoccerImage.src}
              alt="Illustration of a young soccer player"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto flex w-full flex-col gap-4 rounded-2xl bg-line p-12 lg:w-3/4">
              <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-tight font-medium text-ink">
                Outside of code: football on weekends, a camera I&apos;m
                slowly learning to use properly, and a habit of finishing
                side projects about 80% of the way.
              </h2>
            </div>
          </div>
        </div>

        {/* Row 4 — full-width image */}
        <div className="flex justify-center">
          <div className="w-full lg:w-1/2">
            <img
              src={codeThinkingImage.src}
              alt="Illustration of a person thinking through code"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[15svh] z-[-1] h-full w-[275%] -translate-x-1/2 lg:top-[25svh] lg:w-[90%]">
          <svg
            viewBox="0 0 1378 2760"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMin meet"
            className="h-auto w-full"
          >
            {/* Path is --accent (the brighter orange); the row
                illustrations use #8ecae6, a soft sky blue (see their own
                SVG source files) — the two stay visually distinct from each
                other regardless of which gets which. */}
            <path
              ref={pathRef}
              d="M639.668 100C639.668 100 105.669 100 199.669 601.503C293.669 1103.01 1277.17 691.502 1277.17 1399.5C1277.17 2107.5 -155.332 1968 140.168 1438.5C435.669 909.002 1442.66 2093.5 713.168 2659.5"
              stroke="var(--accent)"
              strokeWidth="200"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <section className="flex h-[100svh] w-full items-center justify-center overflow-hidden bg-line p-8">
        <h1 className="w-full text-center font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-[1.1] font-medium text-ink lg:w-3/5">
          That&apos;s the summary version. What follows is the messier, more
          honest one — a gallery of moments, not milestones.
        </h1>
      </section>
    </div>
  );
}
