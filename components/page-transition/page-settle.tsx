"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, motionEaseOut } from "@/utils/gsap-init";
import { useReducedMotion } from "@/utils/use-reduced-motion";

// Migrated off framer-motion (see motionEaseOut's own comment in
// utils/gsap-init.ts for why its ease reproduces Framer's "easeOut"
// exactly): this was the only framer-motion usage anywhere in the root
// layout's render tree, so it was single-handedly forcing framer-motion
// into every route's bundle regardless of whether that page's own
// components need it.
//
// `key={pathname}` forces a full remount on every route change, so the
// inline `opacity: 0, translateY(14px)` style below is both the
// server-rendered/first-paint state (no flash before hydration, same as
// framer-motion's own SSR-baked `initial`) and the fresh starting point
// GSAP animates from on every subsequent navigation.
export function PageSettle({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: reduced ? 0 : 0.4,
      ease: motionEaseOut,
      // Framer Motion clears a settled transform to the literal string
      // "none" rather than leaving a resolved identity matrix behind —
      // GSAP doesn't do this on its own, and a non-"none" `transform`
      // (even a no-op `translate(0px, 0px)`) creates a new CSS containing
      // block for any `position: fixed` descendant, which silently
      // resizes it against this wrapper's own box instead of the real
      // viewport. This wrapper's only content on some routes (e.g.
      // /gallery's full-screen canvas layer) IS such a fixed descendant,
      // so without clearing this, that layer — and the R3F canvas
      // inside it — collapsed to a 0-height box and rendered at Three's
      // default 300x150 fallback size instead of the viewport (confirmed
      // via a headless-browser check comparing this against the
      // pre-migration framer-motion behavior, which left `transform:
      // none` and never triggered this). Matches framer-motion's own
      // at-rest state exactly, not just the visible opacity/position.
      clearProps: "transform",
    });
    // Only `pathname` needs to be a dependency — this effect re-runs on
    // every mount already (key={pathname} remounts the whole subtree),
    // and `reduced`'s value at that moment is what should govern this
    // one transition, same as reading it directly in the transition prop
    // did before.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      key={pathname}
      ref={ref}
      style={{ opacity: 0, transform: "translateY(14px)" }}
    >
      {children}
    </div>
  );
}
