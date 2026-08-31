"use client";

import { useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";
import { PinnedTrack } from "./pinned-track";

type Panel = {
  key: string;
  content: React.ReactNode;
};

/**
 * Renders the plain, normally-scrolling stacked layout on both the server
 * and the first client paint (so there is never a structural hydration
 * mismatch), then upgrades to the pinned horizontal track after mount —
 * but only if the user hasn't asked for reduced motion.
 */
export function HorizontalScrollHome({
  panels,
  pinIndex,
  pinVh,
  pinScrollVh,
  releaseGateRatio,
  pinPauseMs,
}: {
  panels: Panel[];
  /** Forwarded to PinnedTrack — see its own doc comments. Irrelevant (and
   * unused) on the reduced-motion fallback below, which never pins
   * anything at all. */
  pinIndex?: number;
  pinVh?: number;
  pinScrollVh?: MotionValue<number>;
  releaseGateRatio?: MotionValue<number>;
  pinPauseMs?: number;
}) {
  const [usePinned, setUsePinned] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduced) setUsePinned(true);
  }, []);

  if (usePinned) {
    return (
      <PinnedTrack
        pinIndex={pinIndex}
        pinVh={pinVh}
        pinScrollVh={pinScrollVh}
        releaseGateRatio={releaseGateRatio}
        pinPauseMs={pinPauseMs}
      >
        {panels.map((panel) => panel.content)}
      </PinnedTrack>
    );
  }

  return (
    <div className="flex flex-col pt-28 pb-20 sm:pt-36 sm:pb-16">
      {panels.map((panel) => (
        <div
          key={panel.key}
          className="flex min-h-screen flex-col justify-center"
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
