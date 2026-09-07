"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Every GSAP ScrollTrigger instance in this codebase (scroll-path.tsx,
 * hero-scatter.tsx, pinned-reveal.tsx) measures pin/scrub trigger points
 * once, on mount — there's no per-instance recalculation when the page's
 * real layout height changes after that. Preloader (components/preloader/
 * preloader.tsx) hides content behind a fixed ~2.55s timer, not an actual
 * asset-load check, so those measurements can happen before images that
 * are still in flight (several render as plain `<img>` with no reserved
 * width/height/aspect-ratio — see scroll-path.tsx's row illustrations and
 * gallery-wall.tsx) finish loading and grow the page. That growth fires no
 * `resize` event, so nothing tells ScrollTrigger its cached start/end
 * values are now stale — and whether it happens before or after they're
 * measured depends entirely on that machine's network/disk speed, which is
 * exactly why this can look correct on one laptop and drift on another.
 *
 * Mounted once, unconditionally (regardless of reduced-motion/mobile —
 * harmless no-op if no ScrollTrigger instances exist yet), to recompute
 * once the real layout has actually settled.
 */
export function ScrollTriggerRefresh() {
  useEffect(() => {
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    const pendingImages = Array.from(document.images).filter(
      (img) => !img.complete
    );
    pendingImages.forEach((img) => img.addEventListener("load", refresh));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      pendingImages.forEach((img) => img.removeEventListener("load", refresh));
    };
  }, []);

  return null;
}
