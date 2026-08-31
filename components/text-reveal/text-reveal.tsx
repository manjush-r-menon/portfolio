"use client";

import { cloneElement, isValidElement, useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { onPreloaderDone } from "@/components/preloader/preloader-ready";

gsap.registerPlugin(SplitText);

export function TextReveal({
  children,
  delay = 0,
}: {
  children: React.ReactElement;
  delay?: number;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const readyRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotion();

  // A plain subscription, not a prop driven by React state — the
  // callback runs synchronously inside Preloader's own GSAP tick, so
  // .play() fires with no render round-trip in between. See
  // preloader-ready.ts for why that round-trip mattered.
  useEffect(() => {
    return onPreloaderDone(() => {
      readyRef.current = true;
      tweenRef.current?.play();
    });
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const split = SplitText.create(containerRef.current, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        // Re-splits itself whenever a webfont finishes loading or the
        // container resizes — both happen shortly after mount here (the
        // horizontal-scroll wrapper renders a plain stacked layout first,
        // then swaps to its pinned track a tick later). Returning the
        // tween from onSplit lets SplitText track its totalTime across
        // every re-split and fast-forward the new one to match, so an
        // already-playing or already-finished reveal survives instead of
        // restarting against stale, mismatched line geometry.
        autoSplit: true,
        onSplit(self) {
          const tween = gsap.fromTo(
            self.lines,
            { y: reduced ? "0%" : "100%" },
            {
              y: "0%",
              duration: reduced ? 0 : 1,
              stagger: reduced ? 0 : 0.1,
              ease: "power4.out",
              delay: reduced ? 0 : delay,
              paused: !reduced && !readyRef.current,
            }
          );
          tweenRef.current = tween;
          return tween;
        },
      });

      return () => split.revert();
    },
    { scope: containerRef, dependencies: [reduced] }
  );

  if (!isValidElement(children)) return children;

  return cloneElement(
    children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>,
    { ref: containerRef }
  );
}
