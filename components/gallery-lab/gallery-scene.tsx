"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  PHOTO_SECTIONS,
  GRID_THUMBNAIL_WIDTH,
  DETAIL_VIEW_WIDTH,
  getOptimizedSrc,
  type GalleryPhoto,
} from "./photo-data";
import { DEFAULT_CONFIG, CONFIG, resolveThemeColor } from "./gallery-config";
import { rigState, calculateGridDimensions } from "./gallery-state";
import { Rig } from "./gallery-rig";
import { GalleryGrid } from "./gallery-grid";
import { UnifiedControlBar } from "./gallery-control-bar";
import { GalleryTopologyBackground } from "./gallery-topology-background";
import { GalleryMiniMap } from "./gallery-minimap";

// Dev-only Leva debug panel. Dynamically imported so its ~67KB gzip (leva)
// is never fetched by a production visitor — see gallery-debug-panel.tsx.
const GalleryDebugPanel = dynamic(
  () => import("./gallery-debug-panel").then((mod) => mod.GalleryDebugPanel),
  { ssr: false },
);
const isDev = process.env.NODE_ENV === "development";

// Preload both the grid-thumbnail and detail-view variants of every image
// up front. Preloading the larger detail size too (not just fetching it
// lazily on focus) is deliberate: useTexture is Suspense-based, and
// swapping a tile to a URL that hasn't resolved yet would suspend the
// whole grid's Suspense boundary right at the moment of focus — visible as
// the entire canvas going blank. Preloading both sizes here means the
// focus-time URL swap in gallery-tile.tsx always resolves from cache
// instead, keeping the click-to-focus transition exactly as smooth as
// when every tile loaded one full-size image. The tradeoff is more total
// preload traffic than a lazy detail-size fetch would use — reasonable
// here since it's still well under what shipping every image at full
// original resolution cost before this migration.
PHOTO_SECTIONS.forEach((section) => {
  section.images.forEach((image) => {
    useTexture.preload(getOptimizedSrc(image.src, GRID_THUMBNAIL_WIDTH));
    useTexture.preload(getOptimizedSrc(image.src, DETAIL_VIEW_WIDTH));
  });
});

type ZoomTarget = "OUT" | number | null;

interface GridLayer {
  id: string;
  items: GalleryPhoto[];
  mode: "enter" | "exit";
  startTime: number;
}

/**
 * Ported from the reference's ShoeGrid.jsx: the main orchestrator — the 4
 * flat image sections and the enter/exit grid-layer stack for switching
 * between them, plus the camera zoom bridge. No header, no type/color
 * filters, no purchase UI — those were shoe-demo-specific chrome.
 */
export function GalleryScene() {
  const [zoomTarget, setZoomTarget] = useState<ZoomTarget>(null);
  const [initialZoom] = useState(DEFAULT_CONFIG.zoomOut);
  const [currentZoom, setCurrentZoom] = useState(rigState.zoom);
  // Resolved once from the --bg token for the fog color — three.js's Fog
  // needs a concrete color string, it can't resolve a CSS var() itself.
  const [fogColor] = useState(() => resolveThemeColor("--bg"));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentZoom(rigState.zoom);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Single source of truth for "which item is focused," bridged from the
  // mutable rigState.activeId (written by click-to-focus, the close
  // button, a drag-reset, and section switching alike) into real React
  // state. Every tile derives its close button's visibility from the same
  // focusedIndex prop below, so all of them update atomically together —
  // there's no path where an old close button can outlive the new one, or
  // survive a dismiss that didn't go through the button itself.
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setFocusedIndex(rigState.activeId);
    }, 16);
    return () => clearInterval(interval);
  }, []);
  const hasActiveSelection = focusedIndex !== null;

  const isZoomedIn = currentZoom <= CONFIG.zoomIn + 0.5;

  // Responsive zoom for mobile viewports
  useEffect(() => {
    const updateResponsiveZoom = () => {
      const width = window.innerWidth;
      let newZoomOut: number;
      if (width < 480) {
        newZoomOut = 48;
      } else if (width < 768) {
        newZoomOut = 38;
      } else {
        newZoomOut = DEFAULT_CONFIG.zoomOut;
      }
      CONFIG.zoomOut = newZoomOut;
      if (rigState.zoom > CONFIG.zoomIn + 2) {
        rigState.zoom = newZoomOut;
        setCurrentZoom(newZoomOut);
      }
    };
    updateResponsiveZoom();
    window.addEventListener("resize", updateResponsiveZoom);
    return () => window.removeEventListener("resize", updateResponsiveZoom);
  }, []);

  // --- Grid Stack State ---
  const [gridLayers, setGridLayers] = useState<GridLayer[]>(() => [
    {
      id: "init",
      items: PHOTO_SECTIONS[0].images,
      mode: "enter",
      startTime: 0,
    },
  ]);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const handleSectionSwitch = (index: number) => {
    if (index === activeSectionIdx) return;
    const now = Date.now();
    setGridLayers((prev) => {
      const exitingLayers: GridLayer[] = prev.map((layer) =>
        layer.mode === "enter"
          ? { ...layer, mode: "exit" as const, startTime: now }
          : layer,
      );
      const newLayer: GridLayer = {
        id: `grid-${index}-${now}`,
        items: PHOTO_SECTIONS[index].images,
        mode: "enter",
        startTime: now,
      };
      return [...exitingLayers, newLayer];
    });
    setActiveSectionIdx(index);
    rigState.target.set(0, 2, 0);
    rigState.activeId = null;
    setTimeout(() => {
      setGridLayers((prev) => prev.filter((layer) => layer.mode === "enter"));
    }, CONFIG.cleanupTimeout);
  };

  useEffect(() => {
    if (zoomTarget === "OUT") {
      rigState.zoom = CONFIG.zoomOut;
      setCurrentZoom(CONFIG.zoomOut);
      rigState.target.set(0, 2, 0);
    } else if (typeof zoomTarget === "number") {
      rigState.zoom = zoomTarget;
      setCurrentZoom(zoomTarget);
    }
    setZoomTarget(null);
  }, [zoomTarget]);

  const activeLayer = gridLayers[gridLayers.length - 1];
  const itemCount = useMemo(
    () => activeLayer.items.length,
    [activeLayer.items],
  );
  const activeDims = calculateGridDimensions(itemCount);

  return (
    <div
      style={{
        // Fixed + inset:0 rather than width/height:100v*+relative: this
        // route still renders inside the site's root layout (SiteNav,
        // padded <main>, SiteFooter), and a flow-positioned 100vw/100vh
        // block would inherit <main>'s padding offset instead of covering
        // the true viewport.
        position: "fixed",
        inset: 0,
        zIndex: 60,
        // Real DOM element — var() works directly here, no JS resolution needed.
        backgroundColor: "var(--bg)",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      {isDev && <GalleryDebugPanel />}
      <Canvas
        camera={{ position: [0, 0, initialZoom], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      >
        <Rig gridW={activeDims.width} gridH={activeDims.height} />
        <GalleryTopologyBackground
          isZoomedIn={isZoomedIn}
          color={CONFIG.bgColor}
          opacity={CONFIG.bgOpacity}
          speed={CONFIG.bgSpeed}
          scale={CONFIG.bgScale}
          lineThickness={CONFIG.bgLineThickness}
        />
        <fog attach="fog" args={[fogColor, CONFIG.fogNear, CONFIG.fogFar]} />
        <Suspense fallback={null}>
          {gridLayers.map((layer) => (
            <GalleryGrid
              key={layer.id}
              items={layer.items}
              gridVisible={layer.mode === "enter"}
              transitionStartTime={layer.startTime}
              interactive={layer.mode === "enter"}
              focusedIndex={focusedIndex}
            />
          ))}
        </Suspense>
      </Canvas>
      <GalleryMiniMap
        gridDims={activeDims}
        rigState={rigState}
        config={CONFIG}
        totalItems={itemCount}
        isZoomedIn={isZoomedIn}
      />
      <UnifiedControlBar
        sections={PHOTO_SECTIONS.map((s) => ({ id: s.id, title: s.title }))}
        currentSectionIndex={activeSectionIdx}
        onSwitch={handleSectionSwitch}
        setZoomTrigger={setZoomTarget}
        isZoomedIn={isZoomedIn}
        hasActiveSelection={hasActiveSelection}
      />
    </div>
  );
}
