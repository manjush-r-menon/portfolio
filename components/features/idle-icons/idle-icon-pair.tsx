"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/utils/hooks/use-reduced-motion";
import { onPreloaderDone } from "@/components/features/preloader/preloader-ready";
import { gsap, motionEaseInOut } from "@/utils/gsap/gsap-init";

interface IdleIconProps {
  reduced: boolean;
  started: boolean;
}

function DialIcon({ reduced, started }: IdleIconProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reduced || !started) return;
    const el = ref.current;
    if (!el) return;
    // duration/ease/repeat match the original framer-motion `rotate: 360`
    // loop exactly — "linear" easing has no curve to reproduce, so GSAP's
    // "none" (its literal equivalent, not an approximation) is exact here.
    const tween = gsap.to(el, {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
      transformOrigin: "50% 50%",
    });
    return () => {
      tween.kill();
    };
  }, [reduced, started]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 44 44"
      aria-hidden="true"
      className="h-11 w-11 stroke-ink fill-none stroke-[1.5]"
    >
      <rect x="5" y="5" width="34" height="34" rx="4" />
      <circle cx="22" cy="22" r="9" className="stroke-accent" />
      <circle cx="22" cy="13" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FaceIcon({ reduced, started }: IdleIconProps) {
  const leftEyeRef = useRef<SVGLineElement>(null);
  const rightEyeRef = useRef<SVGLineElement>(null);

  // Reproduces the original framer-motion keyframe animation
  // (scaleY: [1, 1, 0.1, 1, 1], duration: 4, ease: "easeInOut",
  // times: [0, 0.9, 0.95, 1, 1]) exactly: those fractions of the 4s
  // duration are 0s/3.6s/3.8s/4s/4s, i.e. hold at 1 until 3.6s, close over
  // 0.2s, reopen over 0.2s, then (a zero-length segment) stay at 1 — which
  // is exactly what positioning these two tweens at t=3.6 and t=3.8 on a
  // 4s-repeating timeline produces, down to reusing the same easeInOut
  // curve (see gsap-init.ts's motionEaseInOut) framer applied to both
  // segments.
  useEffect(() => {
    if (reduced || !started) return;
    const eyes = [leftEyeRef.current, rightEyeRef.current].filter(
      (el): el is SVGLineElement => el !== null,
    );
    if (eyes.length === 0) return;
    const tl = gsap
      .timeline({ repeat: -1 })
      .to(
        eyes,
        {
          scaleY: 0.1,
          duration: 0.2,
          ease: motionEaseInOut,
          transformOrigin: "50% 50%",
        },
        3.6,
      )
      .to(
        eyes,
        {
          scaleY: 1,
          duration: 0.2,
          ease: motionEaseInOut,
          transformOrigin: "50% 50%",
        },
        3.8,
      );
    return () => {
      tl.kill();
    };
  }, [reduced, started]);

  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden="true"
      className="h-11 w-11 stroke-ink fill-none stroke-[1.5]"
    >
      <rect x="5" y="5" width="34" height="34" rx="14" />
      <line
        ref={leftEyeRef}
        x1="16"
        y1="19"
        x2="16"
        y2="25"
        strokeLinecap="round"
        className="stroke-accent"
      />
      <line
        ref={rightEyeRef}
        x1="28"
        y1="19"
        x2="28"
        y2="25"
        strokeLinecap="round"
        className="stroke-accent"
      />
    </svg>
  );
}

export function IdleIconPair() {
  const reduced = !!useReducedMotion();
  // Both icons' loops are purely decorative (no state read elsewhere) and
  // fully hidden behind the preloader curtain — see AmbientShape's doc
  // comment for why deferring their start to onPreloaderDone is safe.
  const [started, setStarted] = useState(false);
  useEffect(() => onPreloaderDone(() => setStarted(true)), []);

  return (
    <div className="flex items-center gap-4">
      <DialIcon reduced={reduced} started={started} />
      <FaceIcon reduced={reduced} started={started} />
    </div>
  );
}
