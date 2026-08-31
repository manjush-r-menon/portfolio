"use client";

import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

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
      animate={reduced ? undefined : { x: [0, 14, -10, 0], y: [0, -12, 10, 0] }}
      transition={
        reduced
          ? undefined
          : { duration: 16, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}
