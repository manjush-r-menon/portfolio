"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/utils/use-reduced-motion";

const GRAIN_WIDTH = 640;
const GRAIN_HEIGHT = 360;
const REDRAW_INTERVAL_MS = 120;

/**
 * Barely-perceptible film-grain texture over the whole site. Drawn small
 * and scaled up via CSS with pixelated rendering, which is what gives it
 * a grain character instead of a smooth blur. Internal resolution controls
 * the apparent grain size — higher = finer grain.
 * z-20: above ordinary page content, below the footer/nav/cursor/curtain.
 */
export function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = GRAIN_WIDTH;
    canvas.height = GRAIN_HEIGHT;
    const imageData = ctx.createImageData(GRAIN_WIDTH, GRAIN_HEIGHT);

    function draw() {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
      ctx!.putImageData(imageData, 0, 0);
    }

    draw();
    if (reduced) return;

    const id = window.setInterval(draw, REDRAW_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full opacity-[0.045] mix-blend-multiply"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
