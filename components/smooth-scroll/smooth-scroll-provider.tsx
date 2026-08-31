"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/utils/use-reduced-motion";

const LenisContext = createContext<Lenis | null>(null);

/**
 * The shared Lenis instance, or null before it's mounted / under reduced
 * motion (where it's never created at all). Exists so a specific pinned
 * section can call `.stop()`/`.start()` on it directly — see PinnedTrack's
 * own doc comment for why a component needs to reach past its own
 * scroll-position math and pause the *actual* scroll driver: a scroll
 * distance-based dwell buffer can't guarantee a minimum viewing time
 * against a fast trackpad/momentum scroll gesture, which can cover
 * hundreds of pixels before the next rendered frame regardless of how
 * that buffer is sized; genuinely stopping Lenis for a fixed duration is
 * the only way to make that guarantee independent of scroll speed.
 */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Feeds a damped scroll value back to the browser for a smoother feel.
 * Skips instantiation entirely under reduced motion, so those users get
 * plain native scroll. framer-motion's `useScroll` reads real
 * `window.scrollY`, which Lenis drives directly (no transform-based
 * virtual scroll), so scroll-linked animations elsewhere keep working
 * unmodified.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      lerp: 0.035,
      wheelMultiplier: 0.45,
      touchMultiplier: 0.45,
    });
    setLenis(instance);

    let rafId: number;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
