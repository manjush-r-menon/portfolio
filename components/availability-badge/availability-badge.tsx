"use client";

import { useReducedMotion } from "@/utils/use-reduced-motion";

export function AvailabilityBadge({
  label = "Available for work — Kochi, IN",
}: {
  label?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`h-1.5 w-1.5 rounded-full bg-[#4c9a5a] ${
          reducedMotion ? "" : "animate-pulse-soft"
        }`}
      />
      <span className="font-sans text-xs tracking-[0.08em] text-ink-dim uppercase">
        {label}
      </span>
    </div>
  );
}
