"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useReducedMotion } from "@/utils/hooks/use-reduced-motion";
import { onPreloaderDone } from "@/components/features/preloader/preloader-ready";

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
  // This ambient drift is purely decorative (aria-hidden, no state anyone
  // else reads) and fully invisible behind the preloader curtain — an
  // infinite framer-motion loop still runs on every animation frame
  // whether or not it's visible, so starting it only once the curtain is
  // gone removes that main-thread work during the curtain with no visible
  // difference (the loop has no meaningful "start phase" a viewer could
  // ever have seen either way).
  const [started, setStarted] = useState(false);
  useEffect(() => onPreloaderDone(() => setStarted(true)), []);

  return (
    <motion.div
      aria-hidden="true"
      className={clsx("pointer-events-none absolute rounded-full", className)}
      style={{
        width: resolvedSize,
        height: resolvedSize,
        background: color,
        opacity: bold ? 0.5 : variant === "accent" ? 0.14 : 0.16,
        filter: bold ? "blur(140px)" : "blur(80px)",
      }}
      animate={
        reduced || !started
          ? undefined
          : { x: [0, 14, -10, 0], y: [0, -12, 10, 0] }
      }
      transition={
        reduced || !started
          ? undefined
          : { duration: 16, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}
