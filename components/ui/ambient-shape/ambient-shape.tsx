"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useReducedMotion } from "@/utils/hooks/use-reduced-motion";
import { onPreloaderDone } from "@/components/features/preloader/preloader-ready";
import { gsap, motionEaseInOut } from "@/utils/gsap/gsap-init";

type AmbientShapeProps = {
  variant?: "neutral" | "accent";
  className?: string;
  size?: number;
  /** A much larger, more saturated glow for a genuine hero moment. */
  bold?: boolean;
};

export function AmbientShape({
  variant = "neutral",
  className,
  size,
  bold = false,
}: AmbientShapeProps) {
  const reduced = useReducedMotion();
  const color = variant === "accent" ? "var(--accent)" : "var(--line-strong)";
  const resolvedSize = size ?? (bold ? 640 : 280);
  const ref = useRef<HTMLDivElement>(null);
  // This ambient drift is purely decorative (aria-hidden, no state anyone
  // else reads) and fully invisible behind the preloader curtain — an
  // infinite GSAP loop still runs on every animation frame whether or not
  // it's visible, so starting it only once the curtain is gone removes
  // that main-thread work during the curtain with no visible difference
  // (the loop has no meaningful "start phase" a viewer could ever have
  // seen either way).
  const [started, setStarted] = useState(false);
  useEffect(() => onPreloaderDone(() => setStarted(true)), []);

  // Reproduces the original framer-motion keyframe animation
  // (x: [0, 14, -10, 0], y: [0, -12, 10, 0], duration: 16, ease: "easeInOut")
  // exactly: framer splits an evenly-spaced keyframe array into equal-length
  // segments (three, here) and applies the same easing curve to each, which
  // is exactly what this 3-tween timeline does with motionEaseInOut (see
  // gsap-init.ts for why that's a byte-for-byte match, not an approximation,
  // of framer's "easeInOut").
  useEffect(() => {
    if (reduced || !started) return;
    const el = ref.current;
    if (!el) return;
    const segment = 16 / 3;
    const tl = gsap
      .timeline({ repeat: -1 })
      .to(el, { x: 14, y: -12, duration: segment, ease: motionEaseInOut })
      .to(el, { x: -10, y: 10, duration: segment, ease: motionEaseInOut })
      .to(el, { x: 0, y: 0, duration: segment, ease: motionEaseInOut });
    return () => {
      tl.kill();
    };
  }, [reduced, started]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={clsx("pointer-events-none absolute rounded-full", className)}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        background: color,
        opacity: bold ? 0.5 : variant === "accent" ? 0.14 : 0.16,
        filter: bold ? "blur(140px)" : "blur(80px)",
      }}
    />
  );
}
