/**
 * Reads a CSS custom property's current resolved value (e.g. "--accent")
 * off :root. Canvas 2D drawing and three.js materials both take plain
 * color strings — neither understands a live var() reference the way the
 * CSS cascade does — so anywhere this experience needs to match the site's
 * real design tokens outside of a Tailwind class, it resolves through
 * here instead of hardcoding a hex that could drift from the token.
 * Returns "" only if called outside a browser, which never happens in
 * practice: everything in this directory is reached through a client-only
 * dynamic import (see gallery-experience.tsx).
 */
export function resolveThemeColor(cssVarName: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(cssVarName)
    .trim();
}

/**
 * Canvas fillStyle/strokeStyle has no equivalent of Tailwind's color-mix()-
 * based `/40` opacity modifiers, so this does the same job by hand for a
 * resolved "#rrggbb" token value.
 */
export function withAlpha(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Tunable numbers for the 3D grid experience, ported 1:1 from the reference
 * shoe-grid's gridConfig.js. Mutated in place (never reassigned as a whole
 * object) so components that read CONFIG.xyz every frame see live edits
 * from the dev-only Leva panel (see gallery-debug-panel.tsx) without
 * needing React state / re-renders.
 */
export interface GalleryConfig {
  gridCols: number;
  itemSize: number;
  gap: number;

  // Physics
  dragSpeed: number;
  dampFactor: number;
  tiltFactor: number;
  clickThreshold: number;
  dragResistance: number;

  // Camera / Zoom
  zoomIn: number;
  zoomOut: number;
  zoomDamp: number;

  // Visuals
  focusScale: number;
  dimScale: number;
  dimOpacity: number;

  // 3D Curvature Effect
  curvatureStrength: number;
  rotationStrength: number;

  // Culling
  cullDistance: number;

  // Minimap
  mapWidth: number;
  mapDotSize: number;

  // Fog
  fogNear: number;
  fogFar: number;

  // Animation
  enterStartOpacity: number;
  enterStartZ: number;
  exitEndZ: number;
  transitionZDamp: number;
  enterOpacityDamp: number;
  exitOpacityDamp: number;
  enterStaggerDelay: number;
  exitStaggerDelay: number;
  cleanupTimeout: number;
  exitSpreadY: number;
  enterSpreadY: number;
  transitionYDamp: number;

  // Tech Background
  /** Resolved from a theme CSS custom property by default — see DEFAULT_CONFIG.bgColor. */
  bgColor: string;
  bgOpacity: number;
  bgSpeed: number;
  bgScale: number;
  bgLineThickness: number;
}

export const DEFAULT_CONFIG: GalleryConfig = {
  gridCols: 8,
  itemSize: 2.5,
  gap: 0.4,

  dragSpeed: 2.2,
  dampFactor: 0.2,
  tiltFactor: 0.08,
  clickThreshold: 5,
  dragResistance: 0.25,

  zoomIn: 12,
  zoomOut: 31,
  zoomDamp: 0.25,

  focusScale: 1.5,
  dimScale: 0.5,
  dimOpacity: 0.15,

  curvatureStrength: 0.06,
  rotationStrength: 0,

  cullDistance: 14,

  mapWidth: 120,
  mapDotSize: 2,

  fogNear: 19,
  fogFar: 100,

  enterStartOpacity: 0.0,
  enterStartZ: -50,
  exitEndZ: 20,
  transitionZDamp: 0.25,
  enterOpacityDamp: 0.85,
  exitOpacityDamp: 0.15,
  enterStaggerDelay: 400,
  exitStaggerDelay: 300,
  cleanupTimeout: 700,
  exitSpreadY: 0.5,
  enterSpreadY: 1,
  transitionYDamp: 0.08,

  // Resolved from the site's --line-strong token (the same one
  // AmbientShape's "neutral" decorative variant uses) rather than a
  // hardcoded hex, so the background pattern matches the design system
  // and stays in sync if that token ever changes. Leva can still override
  // it with a raw hex in dev — see gallery-debug-panel.tsx.
  bgColor: resolveThemeColor("--line-strong"),
  bgOpacity: 0.4,
  bgSpeed: 0.05,
  bgScale: 3.0,
  bgLineThickness: 0.03,
};

export const CONFIG: GalleryConfig = { ...DEFAULT_CONFIG };
