"use client";

import { useEffect, useRef, useState } from "react";
import { resolveThemeColor, withAlpha, type GalleryConfig } from "./gallery-config";
import type { RigState, GridDimensions } from "./gallery-state";

interface GalleryMiniMapProps {
  gridDims: GridDimensions;
  rigState: RigState;
  config: GalleryConfig;
  totalItems: number;
  isZoomedIn: boolean;
}

/**
 * Ported from the reference's MiniMap.jsx: a raw 2D canvas overlay driven
 * by its own rAF loop reading rigState directly. Colors were the
 * reference's hardcoded white/amber placeholders; canvas fillStyle/
 * strokeStyle can't resolve a CSS var() itself, so the real site tokens
 * (--bg for the "quiet" inactive dots, --accent for the selected one) are
 * resolved once on mount via resolveThemeColor and reused every frame.
 */
export function GalleryMiniMap({
  gridDims,
  rigState,
  config,
  totalItems,
  isZoomedIn,
}: GalleryMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef(1);
  const centerRef = useRef({ x: 0.5, y: 0.5 });
  const opacityRef = useRef(0);
  const [dotColor] = useState(() => resolveThemeColor("--bg"));
  const [activeDotColor] = useState(() => resolveThemeColor("--accent"));

  const [mapWidthPercent, setMapWidthPercent] = useState(8);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const aspectRatio = gridDims.width / gridDims.height;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    const updateDimensions = () => {
      let widthPercent = 8;
      if (window.innerWidth < 480) {
        widthPercent = 20;
      } else if (window.innerWidth < 768) {
        widthPercent = 15;
      }
      setMapWidthPercent(widthPercent);

      const width = (window.innerWidth * widthPercent) / 100;
      const height = width / aspectRatio;
      setDimensions({ width, height });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [aspectRatio]);

  const cols = config.gridCols;
  const rows = Math.max(1, Math.ceil(totalItems / cols)); // avoid divide-by-zero below when a section has 0 images

  useEffect(() => {
    let rafId: number;

    const draw = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const isMobile = window.innerWidth < 768;
      const isActive = rigState.isDragging || rigState.activeId !== null;
      const shouldShow = isMobile ? isActive && isZoomedIn : isActive;
      const targetOp = shouldShow ? 1 : 0;
      opacityRef.current += (targetOp - opacityRef.current) * 0.1;
      container.style.opacity = String(opacityRef.current);

      if (opacityRef.current < 0.02) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const isFocused = rigState.activeId !== null;
      const targetZoom = isFocused ? 2.5 : 1;

      let targetCenterX = 0.5;
      let targetCenterY = 0.5;

      if (isFocused && rigState.activeId !== null) {
        const col = rigState.activeId % cols;
        const row = Math.floor(rigState.activeId / cols);
        targetCenterX = (col + 0.5) / cols;
        targetCenterY = (row + 0.5) / rows;
      }

      zoomRef.current += (targetZoom - zoomRef.current) * 0.08;
      centerRef.current.x += (targetCenterX - centerRef.current.x) * 0.08;
      centerRef.current.y += (targetCenterY - centerRef.current.y) * 0.08;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      const zoom = zoomRef.current;
      const cx = centerRef.current.x * w;
      const cy = centerRef.current.y * h;

      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);

      const baseDotSize = Math.max(w, h) * 0.015;
      for (let i = 0; i < totalItems; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const nX = (c + 0.5) / cols;
        const nY = (r + 0.5) / rows;

        const isSelected = rigState.activeId === i;
        const dotSize = isSelected ? baseDotSize * 2 : baseDotSize;

        ctx.beginPath();
        ctx.arc(nX * w, nY * h, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? activeDotColor : withAlpha(dotColor, 0.4);
        ctx.fill();
      }

      if (!isFocused) {
        const offPctX = -rigState.current.x / gridDims.width;
        const offPctY = rigState.current.y / gridDims.height;

        const vFov = (45 * Math.PI) / 180;
        const viewHeight = 2 * Math.tan(vFov / 2) * 10;
        const viewWidth = viewHeight * (window.innerWidth / window.innerHeight);

        const rectW = Math.min(viewWidth / gridDims.width, 1) * w;
        const rectH = Math.min(viewHeight / gridDims.height, 1) * h;
        const rectX = (0.5 + offPctX) * w - rectW / 2;
        const rectY = (0.5 + offPctY) * h - rectH / 2;

        ctx.strokeStyle = withAlpha(dotColor, 0.8);
        ctx.lineWidth = 1.5 / zoom;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
      }

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [gridDims, cols, rows, rigState, config, totalItems, isZoomedIn, dotColor, activeDotColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: "2vh",
        right: "2vw",
        width: `${mapWidthPercent}vw`,
        aspectRatio,
        // Real DOM element, so this can reference the theme tokens
        // directly via CSS color-mix() — no JS resolution needed here
        // the way the canvas drawing above requires.
        background: "color-mix(in srgb, var(--ink) 40%, transparent)",
        backdropFilter: "blur(10px)",
        borderRadius: 0,
        opacity: 0,
        border: "1px solid color-mix(in srgb, var(--bg) 20%, transparent)",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
