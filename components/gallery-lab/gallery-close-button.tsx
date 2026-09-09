"use client";

import { useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

interface GalleryCloseButtonProps {
  isActive: boolean;
  position: [number, number, number];
  onClose: () => void;
}

/**
 * Ported from the reference's CloseButton.jsx. Positioning was adjusted:
 * anchored to a fixed CSS-pixel offset from the image's own corner (see the
 * transform below) instead of the reference's plain `translate(-50%,-150%)`,
 * so the gap reads as a consistent 12px regardless of image size/aspect
 * ratio. `isActive` is also now driven by the caller's own React state
 * (rigState.activeId polled into gallery-scene.tsx) rather than computed
 * ad hoc per tile, so exactly one button can ever be visible at a time.
 */
export function GalleryCloseButton({
  isActive,
  position,
  onClose,
}: GalleryCloseButtonProps) {
  const { gl } = useThree();
  const [shouldShow, setShouldShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);

  // 250ms delay before showing
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isActive) {
      timerRef.current = setTimeout(() => {
        setShouldShow(false);
      }, 0);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    timerRef.current = setTimeout(() => {
      setShouldShow(true);
    }, 250);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  const [x, y, z] = position;

  return (
    <Html
      position={[x, y, z]}
      style={{
        pointerEvents: "auto",
        // `position` above is the image's exact top-right corner (in world
        // space, projected to a screen pixel by drei's Html). This
        // transform is a plain CSS pixel offset from that point — not a
        // percentage of anything image-related — so the button sits a
        // literal, fixed 12px outside the image's right and top edges on
        // screen, regardless of the image's size, aspect ratio, or the
        // current camera zoom. (drei's `center` prop would otherwise be
        // used for "anchor at the middle of this element," but it's
        // irrelevant here since this transform fully replaces it.)
        transform: "translate(12px, calc(-100% - 12px))",
      }}
      occlude
    >
      <style>
        {`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.015); }
          }
        `}
      </style>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseEnter={() => {
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "pointer";
          }
        }}
        onMouseLeave={() => {
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        style={{
          width: "32px",
          height: "32px",
          // border and icon both track `color` via currentColor, so the
          // site's real hover treatment (muted-foreground at rest, accent
          // on hover — see e.g. app/contact/page.tsx's icon links) only
          // needs one property changed on hover instead of two.
          border: "1px solid currentColor",
          color: "var(--ink-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          opacity: shouldShow ? 0.6 : 0,
          animation: shouldShow ? "breathe 3.14s ease-in-out infinite" : "none",
          transform: shouldShow ? "scale(1)" : "scale(0.8)",
          transition: "opacity 0.2s ease, color 0.2s ease",
          background: "transparent",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = "0.8";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseOut={(e) => {
          if (shouldShow) {
            e.currentTarget.style.opacity = "0.6";
          }
          e.currentTarget.style.color = "var(--ink-dim)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </Html>
  );
}
