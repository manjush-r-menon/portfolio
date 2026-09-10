"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTransitionCurtain } from "@/components/page-transition/transition-context";
import galleryCenterPoster from "@/images/gallery-center-poster.svg";
import styles from "./tagline-gallery-entry.module.css";

// See app/gallery/page.tsx — this hover interaction is the 3D gallery
// experience's entry point.
const GALLERY_HREF = "/gallery";

// Matches gallery-center-poster.svg's own viewBox and .cls-2/.cls-3 fill
// tones, so the generated "View Gallery" fragments read as the same
// material as the fetched poster fragments.
const VIEW_BOX_WIDTH = 792;
const VIEW_BOX_HEIGHT = 612;
const CLS_2 = "#d35d20";
const CLS_3 = "#d66e34";

const LEAVE_REVERSE_DELAY_MS = 500;

type GalleryFragment = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "circle";
  rotation: number;
  fill: string;
};

// Rasterizes "View Gallery" on an offscreen canvas, then samples it with a
// jittered (not uniformly-gridded) point per small cell, emitting one tiny
// rounded-rect or circle per hit — closer to the reference poster's tight,
// organic mosaic of small irregular fragments than a blocky fixed grid: the
// jitter breaks the raster-grid look, and the small cell size keeps curves
// (the "G", "a", "y") tracing tightly instead of stair-stepping.
function generateGalleryFragments(): GalleryFragment[] {
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = VIEW_BOX_WIDTH * scale;
  canvas.height = VIEW_BOX_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const label = "View Gallery";
  const targetWidth = canvas.width * 0.82;
  let fontSize = 90 * scale;
  ctx.font = `700 ${fontSize}px Arial, sans-serif`;
  const measured = ctx.measureText(label).width || 1;
  fontSize *= targetWidth / measured;
  ctx.font = `700 ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alphaAt = (px: number, py: number) => {
    const x = Math.min(canvas.width - 1, Math.max(0, Math.round(px)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.round(py)));
    return data[(y * canvas.width + x) * 4 + 3];
  };

  // ~2.6x tighter than the old fixed 9-unit grid (roughly 7x more cells by
  // area), so the mosaic reads as tightly packed rather than pixelated.
  const cellUnits = 3.5;
  const cell = cellUnits * scale;
  const fragments: GalleryFragment[] = [];

  let rowIndex = 0;
  for (let cy = 0; cy < canvas.height; cy += cell, rowIndex++) {
    const rowStagger = rowIndex % 2 === 0 ? 0 : cell / 2;
    for (let cx = -cell; cx < canvas.width + cell; cx += cell) {
      // A random point within the cell (not its fixed center) is what
      // actually breaks the "sampled on a grid" look — neighboring cells'
      // hit-or-miss becomes irregular the way hand-scattered fragments are.
      const px = cx + rowStagger + gsap.utils.random(-cell * 0.45, cell * 0.45);
      const py = cy + cell / 2 + gsap.utils.random(-cell * 0.45, cell * 0.45);
      if (alphaAt(px, py) < 140) continue;

      const baseSize = gsap.utils.random(2, 5);
      fragments.push({
        x: px / scale,
        y: py / scale,
        width: baseSize * gsap.utils.random(0.75, 1.3),
        height: baseSize * gsap.utils.random(0.75, 1.3),
        shape: Math.random() < 0.72 ? "rect" : "circle",
        rotation: gsap.utils.random(-16, 16),
        fill: Math.random() < 0.22 ? CLS_2 : CLS_3,
      });
    }
  }

  return fragments;
}

export function TaglineGalleryEntry({ className }: { className?: string }) {
  const router = useRouter();
  const { playTransition } = useTransitionCurtain();
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLButtonElement>(null);
  const originalSvgRef = useRef<SVGSVGElement>(null);
  const galleryGroupRef = useRef<SVGGElement>(null);

  // Held as the exact { __html } object dangerouslySetInnerHTML expects
  // (not just the string) so its reference is stable across re-renders —
  // otherwise a fresh object literal in JSX on every render (e.g. from the
  // `settled` state flip) makes React reset innerHTML each time, wiping out
  // every inline style GSAP has applied to the fetched fragments.
  const [originalHtml, setOriginalHtml] = useState<{ __html: string } | null>(
    null
  );
  const [galleryFragments, setGalleryFragments] = useState<GalleryFragment[]>(
    []
  );
  const [settled, setSettled] = useState(false);

  // The in-flight/settled timeline, its "mouse has left, waiting to
  // reverse" flag, and the pending reverse's timeout id all need to
  // survive across renders without themselves triggering one.
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const leaveRequestedRef = useRef(false);
  const reverseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // The live tagline is a plain <img> pointing at a static SVG asset
  // (see gallery-wall.tsx) so its path fragments never reach the DOM. This
  // fetches the same asset's markup and inlines it, so GSAP can target each
  // fragment individually instead of only the whole <img>.
  useEffect(() => {
    let cancelled = false;
    fetch(galleryCenterPoster.src)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        setOriginalHtml({ __html: doc.documentElement.innerHTML });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setGalleryFragments(generateGalleryFragments());
  }, []);

  function clearReverseTimeout() {
    if (reverseTimeoutRef.current) {
      clearTimeout(reverseTimeoutRef.current);
      reverseTimeoutRef.current = null;
    }
  }
  useEffect(() => clearReverseTimeout, []);

  const { contextSafe } = useGSAP(
    () => {
      // Fragment lists changed under it (asset fetch/canvas generation
      // landing) — any timeline built against the old, empty DOM lists is
      // stale.
      tlRef.current = null;
    },
    { scope: rootRef, dependencies: [originalHtml, galleryFragments.length] }
  );

  const scheduleReverse = contextSafe(() => {
    clearReverseTimeout();
    reverseTimeoutRef.current = setTimeout(() => {
      if (leaveRequestedRef.current && tlRef.current) {
        tlRef.current.reverse();
      }
    }, LEAVE_REVERSE_DELAY_MS);
  });

  const buildTimeline = contextSafe(() => {
    const originals = originalSvgRef.current
      ? Array.from(
          originalSvgRef.current.querySelectorAll<SVGGraphicsElement>(
            "path, rect, polygon, circle"
          )
        )
      : [];
    const galleryEls = galleryGroupRef.current
      ? Array.from(
          galleryGroupRef.current.querySelectorAll<SVGGraphicsElement>(
            "rect, circle"
          )
        )
      : [];

    if (originals.length === 0 || galleryEls.length === 0) return null;

    gsap.set(originals, {
      y: 0,
      skewY: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: "center",
    });
    gsap.set(galleryEls, { opacity: 0, transformOrigin: "center" });

    // One continuous timeline — break-apart, an instant swap, then settle —
    // so hover-leave can pause, resume, or reverse it as a single unit
    // instead of juggling two separate fades.
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        setSettled(true);
        if (leaveRequestedRef.current) scheduleReverse();
      },
      onReverseComplete: () => {
        setSettled(false);
        leaveRequestedRef.current = false;
        tlRef.current = null;
      },
    });

    tl.to(originals, {
      y: () => gsap.utils.random(-38, 38),
      skewY: () => gsap.utils.random(-22, 22),
      rotation: () => gsap.utils.random(-18, 18),
      scale: () => gsap.utils.random(0.25, 0.6),
      opacity: 0,
      duration: 0.5,
      ease: "power1.in",
      stagger: { amount: 0.4, from: "random" },
    });

    tl.set(galleryEls, {
      y: () => gsap.utils.random(-38, 38),
      skewY: () => gsap.utils.random(-22, 22),
      rotation: () => gsap.utils.random(-18, 18),
      scale: () => gsap.utils.random(0.25, 0.6),
      opacity: 0,
    });

    tl.to(galleryEls, {
      y: 0,
      skewY: 0,
      // Settles to each fragment's own baked-in tilt (data-rot, from
      // generateGalleryFragments) rather than a flat 0 — that per-fragment
      // irregularity is what reads as organic scatter instead of a
      // perfectly uniform grid once everything's at rest.
      rotation: (_i, target: SVGGraphicsElement) =>
        parseFloat(target.getAttribute("data-rot") ?? "0"),
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "elastic.out(1, 0.45)",
      stagger: { amount: 0.55, from: "random" },
    });

    return tl;
  });

  const handleEnter = contextSafe(() => {
    if (reduced) return;
    leaveRequestedRef.current = false;
    clearReverseTimeout();

    if (tlRef.current) {
      // Already mid-flight (forward or reversing) — just make sure it's
      // headed toward "settled" again rather than restarting it, which is
      // what keeps a rapid leave/re-enter from glitching.
      if (tlRef.current.progress() < 1) tlRef.current.play();
      return;
    }

    const tl = buildTimeline();
    if (!tl) return;
    tlRef.current = tl;
    tl.play();
  });

  const handleLeave = contextSafe(() => {
    if (reduced) return;
    leaveRequestedRef.current = true;
    if (!tlRef.current) return;
    // Still breaking apart / settling — let it finish; onComplete checks
    // leaveRequestedRef and schedules the reverse itself. Already settled —
    // schedule it now.
    if (tlRef.current.progress() >= 1) scheduleReverse();
  });

  function handleClick() {
    // Reduced motion skips the ripple entirely (handleEnter/handleLeave
    // both bail early), so `settled` never flips true — the whole poster
    // is the gallery entry point regardless.
    if (!reduced && !settled) return;
    playTransition(GALLERY_HREF, () => router.push(GALLERY_HREF));
  }

  return (
    <button
      ref={rootRef}
      type="button"
      className={[
        className,
        styles.root,
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onClick={handleClick}
      aria-label={
        reduced || settled
          ? "View gallery"
          : "Live life with passion and purpose — view gallery"
      }
    >
      <span className={styles.frame}>
        <svg
          ref={originalSvgRef}
          className={styles.layer}
          viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          dangerouslySetInnerHTML={originalHtml ?? undefined}
        />
        <svg
          className={styles.layer}
          viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g ref={galleryGroupRef}>
            {galleryFragments.map((fragment, index) =>
              fragment.shape === "circle" ? (
                <circle
                  key={index}
                  cx={fragment.x}
                  cy={fragment.y}
                  r={(fragment.width + fragment.height) / 4}
                  fill={fragment.fill}
                  // Hidden until the first hover's buildTimeline() takes
                  // over via GSAP — otherwise these paint on top of the
                  // original tagline (later in DOM order) fully opaque
                  // from the moment they're generated, before any hover
                  // has ever run gsap.set(galleryEls, { opacity: 0 }).
                  opacity={0}
                />
              ) : (
                <rect
                  key={index}
                  data-rot={fragment.rotation}
                  x={fragment.x - fragment.width / 2}
                  y={fragment.y - fragment.height / 2}
                  width={fragment.width}
                  height={fragment.height}
                  rx={Math.min(fragment.width, fragment.height) * 0.3}
                  fill={fragment.fill}
                  opacity={0}
                />
              )
            )}
          </g>
        </svg>
      </span>
    </button>
  );
}
