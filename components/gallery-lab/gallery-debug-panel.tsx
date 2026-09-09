"use client";

import { useEffect } from "react";
import { Leva, useControls } from "leva";
import { CONFIG, DEFAULT_CONFIG } from "./gallery-config";

/**
 * Dev-only Leva controls, ported from the reference's useGridConfig.js +
 * its inline <Leva/> render in ShoeGrid.jsx. Kept as its own component
 * (rather than a hook that always runs) so gallery-scene.tsx can load it
 * via next/dynamic behind a NODE_ENV check. This keeps leva's ~67KB gzip
 * entirely out of what a production visitor downloads: the dynamic import
 * is only ever requested when process.env.NODE_ENV === "development".
 */
export function GalleryDebugPanel() {
  const gridControls = useControls(
    "Gallery Grid",
    {
      curvatureStrength: {
        value: DEFAULT_CONFIG.curvatureStrength,
        min: 0,
        max: 0.2,
        step: 0.001,
        label: "Curvature Strength",
      },
      rotationStrength: {
        value: DEFAULT_CONFIG.rotationStrength,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Rotation Strength",
      },
      focusScale: {
        value: DEFAULT_CONFIG.focusScale,
        min: 1,
        max: 3,
        step: 0.1,
        label: "Focus Scale",
      },
      dimScale: {
        value: DEFAULT_CONFIG.dimScale,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Dim Scale",
      },
      dimOpacity: {
        value: DEFAULT_CONFIG.dimOpacity,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Dim Opacity",
      },
      dragSpeed: {
        value: DEFAULT_CONFIG.dragSpeed,
        min: 0.1,
        max: 3,
        step: 0.1,
        label: "Drag Speed",
      },
      dampFactor: {
        value: DEFAULT_CONFIG.dampFactor,
        min: 0.05,
        max: 0.5,
        step: 0.05,
        label: "Damp Factor",
      },
      tiltFactor: {
        value: DEFAULT_CONFIG.tiltFactor,
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "Tilt Factor",
      },
      zoomIn: {
        value: DEFAULT_CONFIG.zoomIn,
        min: 5,
        max: 30,
        step: 1,
        label: "Zoom In",
      },
      zoomDamp: {
        value: DEFAULT_CONFIG.zoomDamp,
        min: 0.05,
        max: 0.5,
        step: 0.05,
        label: "Zoom Damp",
      },
      zoomOut: {
        value: DEFAULT_CONFIG.zoomOut,
        min: 10,
        max: 100,
        step: 1,
        label: "Zoom Out",
      },
    },
    { collapsed: true, order: 0 },
  );

  const transitionControls = useControls(
    "Transition",
    {
      enterStartOpacity: {
        value: DEFAULT_CONFIG.enterStartOpacity,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Enter Start Opacity",
      },
      enterStartZ: {
        value: DEFAULT_CONFIG.enterStartZ,
        min: -50,
        max: 0,
        step: 1,
        label: "Enter Start Z",
      },
      exitEndZ: {
        value: DEFAULT_CONFIG.exitEndZ,
        min: 0,
        max: 50,
        step: 1,
        label: "Exit End Z",
      },
      transitionZDamp: {
        value: DEFAULT_CONFIG.transitionZDamp,
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "Transition Z Damp",
      },
      enterOpacityDamp: {
        value: DEFAULT_CONFIG.enterOpacityDamp,
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "Enter Opacity Damp",
      },
      exitOpacityDamp: {
        value: DEFAULT_CONFIG.exitOpacityDamp,
        min: 0.05,
        max: 1,
        step: 0.05,
        label: "Exit Opacity Damp",
      },
      enterStaggerDelay: {
        value: DEFAULT_CONFIG.enterStaggerDelay,
        min: 0,
        max: 2000,
        step: 50,
        label: "Enter Stagger Delay (ms)",
      },
      exitStaggerDelay: {
        value: DEFAULT_CONFIG.exitStaggerDelay,
        min: 0,
        max: 1000,
        step: 50,
        label: "Exit Stagger Delay (ms)",
      },
      cleanupTimeout: {
        value: DEFAULT_CONFIG.cleanupTimeout,
        min: 500,
        max: 3000,
        step: 100,
        label: "Cleanup Timeout (ms)",
      },
      exitSpreadY: {
        value: DEFAULT_CONFIG.exitSpreadY,
        min: 0,
        max: 10,
        step: 0.5,
        label: "Exit Spread Y",
      },
      enterSpreadY: {
        value: DEFAULT_CONFIG.enterSpreadY,
        min: 0,
        max: 10,
        step: 0.5,
        label: "Enter Spread Y",
      },
      transitionYDamp: {
        value: DEFAULT_CONFIG.transitionYDamp,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Y Damp (lower=faster)",
      },
    },
    { collapsed: true, order: 1 },
  );

  const bgControls = useControls(
    "BG Shader",
    {
      bgColor: { value: DEFAULT_CONFIG.bgColor, label: "Color" },
      bgOpacity: {
        value: DEFAULT_CONFIG.bgOpacity,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Opacity",
      },
      bgSpeed: {
        value: DEFAULT_CONFIG.bgSpeed,
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "Speed",
      },
      bgScale: {
        value: DEFAULT_CONFIG.bgScale,
        min: 1,
        max: 10,
        step: 0.5,
        label: "Scale",
      },
      bgLineThickness: {
        value: DEFAULT_CONFIG.bgLineThickness,
        min: 0.01,
        max: 0.1,
        step: 0.01,
        label: "Thickness",
      },
    },
    { collapsed: true, order: 2 },
  );

  useEffect(() => {
    Object.assign(CONFIG, gridControls, transitionControls, bgControls);
  }, [gridControls, transitionControls, bgControls]);

  return <Leva collapsed hidden={false} />;
}
