"use client";

import { cloneElement, useRef, type ReactElement, type RefAttributes } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/utils/use-reduced-motion";

/**
 * Ported from /references/ (src/components/gsap.jsx): cursor-proximity pull
 * toward center on mousemove, elastic return on mouseleave, via
 * gsap.quickTo on x/y. The reference attaches its mousemove/mouseleave
 * listeners with a bare useEffect and never removes them — fine for its
 * single-page demo, but a real leak here since these mount/unmount as users
 * navigate. Ported through useGSAP (scoped to the wrapped element) instead,
 * matching the cleanup pattern already used for gsap work elsewhere in this
 * repo (see hero-scatter.tsx, scroll-path.tsx) — its context revert kills
 * the quickTo tweens automatically, and the returned function below removes
 * the two listeners explicitly.
 */
export function MagneticIcon({
  children,
}: {
  children: ReactElement<RefAttributes<HTMLElement>>;
}) {
  const magnetic = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = magnetic.current;
      if (!el) return;

      // Same lag guard used in hero-scatter.tsx/scroll-path.tsx: `reduced`
      // starts false and only corrects itself a tick later, which can let
      // this effect fire first and wire up the pull for a user who actually
      // has reduced motion on. Reading matchMedia directly sidesteps that.
      const prefersReduced =
        reduced ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (prefersReduced) return;

      const xTo = gsap.quickTo(el, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(el, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = el.getBoundingClientRect();
        xTo(clientX - (left + width / 2));
        yTo(clientY - (top + height / 2));
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("mousemove", handleMouseMove);
      el.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        el.removeEventListener("mousemove", handleMouseMove);
        el.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: magnetic, dependencies: [reduced] }
  );

  return cloneElement(children, { ref: magnetic });
}
