"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { useIsMobileScroll } from "@/utils/use-is-mobile-scroll";

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
 * Skips instantiation entirely under reduced motion or on mobile-scroll
 * widths (see MOBILE_SCROLL_BREAKPOINT), so those users get plain native
 * scroll — Lenis's touch handling is a known source of scroll-hijack/
 * momentum conflicts on mobile Safari, and nothing on mobile needs Lenis's
 * scroll-position control. framer-motion's `useScroll` reads real
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
  const isMobileScroll = useIsMobileScroll();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  // Read inside the pathname effect below instead of listing `lenis` as a
  // dependency — this ref always holds the current instance (or null)
  // without making that effect re-fire just because Lenis itself was
  // recreated (e.g. a reduced-motion/mobile-width toggle), which should be
  // unrelated to "did the route change."
  const lenisRef = useRef<Lenis | null>(null);
  lenisRef.current = lenis;

  useEffect(() => {
    if (reduced || isMobileScroll) return;

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
  }, [reduced, isMobileScroll]);

  // Client-side navigation (TransitionLink's router.push — see
  // transition-link.tsx — or browser back/forward; history.scrollRestoration
  // is 'manual' site-wide per app/layout.tsx, so nothing restores scroll
  // automatically there either) otherwise leaves the browser's real scrollY
  // exactly where it was on the previous page: a new route mounts already
  // scrolled halfway down, matching wherever the last page was left.
  // Resetting native scroll alone isn't enough once Lenis is running,
  // either — Lenis keeps its own internal target/animated-scroll state (it
  // drives window.scrollY directly, see this file's own doc comment above),
  // which a plain window.scrollTo doesn't know to update, so Lenis's very
  // next animation frame fights the reset back toward its stale target.
  // Resetting both explicitly on every pathname change is what actually
  // makes a new page start at the top regardless of where the last one was
  // left. This runs while TransitionLink's wipe is still fully covering the
  // screen (router.push fires mid-cover, before the uncover half starts —
  // see transition-provider.tsx), so there's nothing to visibly jump.
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
