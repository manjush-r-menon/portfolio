"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import gsap from "gsap";

const LERP = 0.18;

type CursorMode = "default" | "link" | "drag";

export function DualCursor() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  // Independent of `mode`: whether the pointer is over a dark-background
  // surface (e.g. BloomPanel's contact form — see its `data-cursor-light`)
  // where the default dark dot/ring would be invisible or low-contrast
  // against it, regardless of which mode shape is showing.
  const [onDark, setOnDark] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setMounted(true);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    function setDotPosition(x: number, y: number) {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
    }

    function setRingPosition(x: number, y: number) {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
    }

    function onMove(event: MouseEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      setDotPosition(mouseX, mouseY);
      if (reducedMotion) {
        ringX = mouseX;
        ringY = mouseY;
        setRingPosition(ringX, ringY);
      }
    }

    // Re-derives mode/onDark from whatever is actually under the cursor
    // right now, via elementFromPoint rather than listening for a
    // `mouseover` bubble. A `mouseover`-only approach only fires when the
    // pointer physically crosses an element boundary — it never fires when
    // content appears/disappears *under* an already-stationary cursor,
    // which is exactly what happens when BloomPanel blooms open centered
    // on screen: a user clicks the trigger, doesn't move the mouse, and
    // the panel now sitting under their cursor gets no mouseover event at
    // all, leaving the cursor showing whatever mode/color was live before
    // the click. Polling every animation frame instead closes that gap —
    // React bails out re-rendering on repeated identical setState calls,
    // so this costs nothing extra on the (overwhelmingly common) frames
    // where nothing under the cursor has changed.
    function detectSurface() {
      const el = document.elementFromPoint(mouseX, mouseY) as HTMLElement | null;
      if (el?.closest('[data-cursor="drag"]')) {
        setMode("drag");
      } else if (el?.closest("a, button")) {
        setMode("link");
      } else {
        setMode("default");
      }
      setOnDark(!!el?.closest("[data-cursor-light]"));
    }

    window.addEventListener("mousemove", onMove);

    setDotPosition(mouseX, mouseY);
    setRingPosition(ringX, ringY);

    // Registered on GSAP's shared ticker instead of its own
    // requestAnimationFrame loop — GSAP is already loaded and its ticker
    // already running on every page (the preloader alone guarantees that,
    // see components/features/preloader/preloader.tsx), so this removes one
    // independent rAF registration site-wide for free rather than trading
    // it for a new one. The ticker fires this callback once per animation
    // frame by default, same cadence as raw rAF, and `tick` doesn't use
    // the (time/deltaTime/frame) args GSAP passes it — it's a fixed
    // per-frame lerp step either way, so the swap doesn't change how often
    // or how this runs.
    function tick() {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      setRingPosition(ringX, ringY);
      detectSurface();
    }
    if (!reducedMotion) {
      gsap.ticker.add(tick);
    } else {
      // No position-lerp needed here (onMove already snaps the ring
      // straight to the pointer under reduced motion), but mode/onDark
      // detection still needs to run every frame regardless.
      gsap.ticker.add(detectSurface);
    }

    document.documentElement.classList.add("cursor-hidden");

    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(tick);
      gsap.ticker.remove(detectSurface);
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={clsx(
          "pointer-events-none fixed top-0 left-0 z-[70] h-[5px] w-[5px] rounded-full transition-[opacity,background-color] duration-200",
          onDark ? "bg-white" : "bg-ink",
          mode === "drag" ? "opacity-0" : "opacity-100"
        )}
      />
      <div
        ref={ringRef}
        className={clsx(
          "pointer-events-none fixed top-0 left-0 z-[70] flex items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-200 ease-out",
          mode === "drag"
            ? "h-20 w-20 border-white bg-ink/30"
            : mode === "link"
              ? clsx("h-3.5 w-3.5", onDark ? "border-white" : "border-accent")
              : clsx("h-[30px] w-[30px]", onDark ? "border-white" : "border-ink-dim")
        )}
      >
        {mode === "drag" && (
          <span className="font-sans text-[11px] font-semibold tracking-[0.06em] text-white uppercase">
            Drag me
          </span>
        )}
      </div>
    </>
  );
}
