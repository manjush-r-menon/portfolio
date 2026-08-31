"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const LERP = 0.18;

type CursorMode = "default" | "link" | "drag";

export function DualCursor() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
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
    let raf = 0;

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

    function onOver(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-cursor="drag"]')) {
        setMode("drag");
      } else if (target?.closest("a, button")) {
        setMode("link");
      } else {
        setMode("default");
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    setDotPosition(mouseX, mouseY);
    setRingPosition(ringX, ringY);

    if (!reducedMotion) {
      const tick = () => {
        ringX += (mouseX - ringX) * LERP;
        ringY += (mouseY - ringY) * LERP;
        setRingPosition(ringX, ringY);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    document.documentElement.classList.add("cursor-hidden");

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={clsx(
          "pointer-events-none fixed top-0 left-0 z-[70] h-[5px] w-[5px] rounded-full bg-ink transition-opacity duration-200",
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
              ? "h-3.5 w-3.5 border-accent"
              : "h-[30px] w-[30px] border-ink-dim"
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
