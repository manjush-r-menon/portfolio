"use client";

import { useEffect, useState } from "react";

export const MOBILE_SCROLL_BREAKPOINT = 1024;

/**
 * A direct, synchronous matchMedia read for the same breakpoint
 * useIsMobileScroll tracks reactively. useIsMobileScroll itself must start
 * `false` on both server and first client render to stay hydration-safe
 * (several consumers — HeroScatter, AboutDivider — gate whether they render
 * anything at all on its value, so it can't resolve to a real client-side
 * answer any earlier without risking a structural mismatch). That means any
 * effect reading the hook's return value on its own first run sees that
 * same stale `false`, one tick before the hook's internal effect corrects
 * it — which previously caused a few effects (building a ScrollTrigger
 * instance, instantiating Lenis) to act once on the wrong assumption and
 * immediately redo that work once the real value landed. Calling this
 * function directly inside such an effect — the same trick
 * horizontal-scroll-home.tsx and about-client.tsx already used for exactly
 * this — gets the real answer on that same first run instead, without
 * changing what the hook returns during render or touching hydration
 * safety at all.
 */
export function matchesMobileScrollBreakpoint(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_SCROLL_BREAKPOINT - 1}px)`)
    .matches;
}

export function useIsMobileScroll() {
  const [isMobileScroll, setIsMobileScroll] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${MOBILE_SCROLL_BREAKPOINT - 1}px)`,
    );
    setIsMobileScroll(query.matches);

    function onChange(event: MediaQueryListEvent) {
      setIsMobileScroll(event.matches);
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isMobileScroll;
}
