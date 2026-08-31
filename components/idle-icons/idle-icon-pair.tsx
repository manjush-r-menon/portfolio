"use client";

import { motion, useReducedMotion } from "framer-motion";

function DialIcon({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 44 44"
      aria-hidden="true"
      className="h-11 w-11 stroke-ink fill-none stroke-[1.5]"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={
        reduced
          ? undefined
          : { duration: 8, repeat: Infinity, ease: "linear" }
      }
    >
      <rect x="5" y="5" width="34" height="34" rx="4" />
      <circle cx="22" cy="22" r="9" className="stroke-accent" />
      <circle cx="22" cy="13" r="1.4" fill="currentColor" stroke="none" />
    </motion.svg>
  );
}

function FaceIcon({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden="true"
      className="h-11 w-11 stroke-ink fill-none stroke-[1.5]"
    >
      <rect x="5" y="5" width="34" height="34" rx="14" />
      <motion.line
        x1="16"
        y1="19"
        x2="16"
        y2="25"
        strokeLinecap="round"
        className="stroke-accent"
        animate={reduced ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        style={{ originY: 0.5, originX: 0.5 }}
        transition={
          reduced
            ? undefined
            : {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.9, 0.95, 1, 1],
              }
        }
      />
      <motion.line
        x1="28"
        y1="19"
        x2="28"
        y2="25"
        strokeLinecap="round"
        className="stroke-accent"
        animate={reduced ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        style={{ originY: 0.5, originX: 0.5 }}
        transition={
          reduced
            ? undefined
            : {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.9, 0.95, 1, 1],
              }
        }
      />
    </svg>
  );
}

export function IdleIconPair() {
  const reduced = !!useReducedMotion();

  return (
    <div className="flex items-center gap-4">
      <DialIcon reduced={reduced} />
      <FaceIcon reduced={reduced} />
    </div>
  );
}
