"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import clsx from "clsx";
import { useReducedMotion } from "@/utils/use-reduced-motion";

const REVEAL_RADIUS = 60;

// The dark text drawn on top of the blob is still clipped to a circle, but
// unlike the blob below, it's fine for this one to clip against the box —
// we don't want revealed text bleeding past where the real text actually
// is, so a tight, unpadded box is correct here.
function maskFor(x: number, y: number, r: number) {
  return `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0, black ${r}px, transparent ${r}px)`;
}

const INITIAL_MASK = maskFor(0, 0, 0);

export function SecretReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLParagraphElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const spot = useRef({ x: 0, y: 0, r: 0 });
  const reduced = useReducedMotion();

  function applyMask() {
    const { x, y, r } = spot.current;

    if (overlayRef.current) {
      const mask = maskFor(x, y, r);
      overlayRef.current.style.maskImage = mask;
      overlayRef.current.style.webkitMaskImage = mask;
    }

    // The round shape itself: a plain circle via border-radius, not a
    // mask, so — unlike the text reveal above — it's never clipped by any
    // bounding box. It can extend past the text's edges with no cutoff,
    // which is what actually fixes the edge-clipping problem.
    if (blobRef.current) {
      blobRef.current.style.width = `${r * 2}px`;
      blobRef.current.style.height = `${r * 2}px`;
      blobRef.current.style.transform = `translate(${x - r}px, ${y - r}px)`;
    }
  }

  useEffect(() => {
    return () => {
      gsap.killTweensOf(spot.current);
    };
  }, []);

  function positionFromEvent(event: React.MouseEvent) {
    const rect = wrapperRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handleEnter(event: React.MouseEvent) {
    const { x, y } = positionFromEvent(event);
    spot.current.x = x;
    spot.current.y = y;
    gsap.to(spot.current, {
      r: REVEAL_RADIUS,
      duration: reduced ? 0 : 0.45,
      ease: reduced ? "none" : "back.out(1.6)",
      overwrite: "auto",
      onUpdate: applyMask,
    });
  }

  function handleMove(event: React.MouseEvent) {
    const { x, y } = positionFromEvent(event);
    gsap.to(spot.current, {
      x,
      y,
      duration: reduced ? 0 : 0.18,
      ease: reduced ? "none" : "power2.out",
      overwrite: "auto",
      onUpdate: applyMask,
    });
  }

  function handleLeave() {
    gsap.to(spot.current, {
      r: 0,
      duration: reduced ? 0 : 0.35,
      ease: reduced ? "none" : "power3.out",
      overwrite: "auto",
      onUpdate: applyMask,
    });
  }

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={clsx("relative", className)}
    >
      {/* Real, accessible copy — stays in the DOM and readable by screen
          readers. Color-matched to the page background so sighted users
          see nothing until the spotlight reveals the overlay below. */}
      <p className="font-sans text-2xl leading-snug text-bg">{children}</p>

      {/* The round shape — a free-floating circle, unmasked, so it never
          clips against a box. This is the reference's solid-fill ".mask"
          disc. */}
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-accent"
        style={{ width: 0, height: 0 }}
      />

      {/* Dark text drawn on top of the blob, hidden from assistive tech,
          masked to the same circle so it only reads within it. */}
      <p
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 font-sans text-2xl leading-snug text-ink select-none"
        style={{ maskImage: INITIAL_MASK, WebkitMaskImage: INITIAL_MASK }}
      >
        {children}
      </p>
    </div>
  );
}
