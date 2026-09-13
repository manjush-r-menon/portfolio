"use client";

import {
  Suspense,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import {
  PHOTO_SECTIONS,
  GRID_THUMBNAIL_WIDTH,
  getOptimizedSrc,
  type GalleryPhoto,
} from "./photo-data";
import { preloadTexturesInBatches } from "./preload-textures";
import { DEFAULT_CONFIG, CONFIG, resolveThemeColor } from "./gallery-config";
import { rigState, calculateGridDimensions } from "./gallery-state";
import { Rig } from "./gallery-rig";
import { GalleryGrid } from "./gallery-grid";
import { UnifiedControlBar } from "./gallery-control-bar";
import { GalleryTopologyBackground } from "./gallery-topology-background";
import { GalleryMiniMap } from "./gallery-minimap";
import { GalleryBackButton } from "./gallery-back-button";

// Dev-only Leva debug panel. Dynamically imported so its ~67KB gzip (leva)
// is never fetched by a production visitor — see gallery-debug-panel.tsx.
const GalleryDebugPanel = dynamic(
  () => import("./gallery-debug-panel").then((mod) => mod.GalleryDebugPanel),
  { ssr: false },
);
const isDev = process.env.NODE_ENV === "development";

// Thumbnail URLs for a section, batch-preloaded (see preloadTexturesInBatches)
// rather than every image in the gallery being requested up front. Detail-
// view textures are never preloaded here at all — gallery-tile.tsx's own
// useTexture call requests that size lazily, only once a tile is actually
// focused. Both the section-switch (handleSectionSwitch below) and the
// focus toggle (setFocusedIndex below) are wrapped in startTransition, so
// when a not-yet-loaded texture causes a tile to suspend, React keeps
// showing the previously-rendered content (the outgoing section, or the
// tile's own thumbnail) instead of dropping to the Suspense fallback —
// same mechanism, applied to the loading strategy this component comment
// used to describe eagerly preloading everything to avoid.
function preloadSectionThumbnails(sectionIndex: number) {
  const urls = PHOTO_SECTIONS[sectionIndex].images.map((image) =>
    getOptimizedSrc(image.src, GRID_THUMBNAIL_WIDTH),
  );
  preloadTexturesInBatches(urls);
}

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
      // Wrapped in startTransition: focusing a tile swaps its requested
      // texture from the (already-loaded) grid-thumbnail size to the
      // detail-view size, which is only preloaded lazily now (see
      // preloadSectionThumbnails above and gallery-tile.tsx). Without a
      // transition, that not-yet-resolved texture would suspend and the
      // Suspense fallback (null) would replace the tile immediately; inside
      // a transition, React instead keeps showing the tile's last-committed
      // render (the thumbnail, already on screen) until the detail texture
      // resolves, then commits the swap — a brief quality upgrade rather
      // than a blank flash.
      startTransition(() => {
        setFocusedIndex(rigState.activeId);
      });
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

  // Only the initially-visible section's thumbnails are preloaded on
  // mount — the other 3 sections' images are requested when the user
  // actually switches to them (below), not all 4 up front.
  useEffect(() => {
    preloadSectionThumbnails(0);
  }, []);

  const handleSectionSwitch = (index: number) => {
    if (index === activeSectionIdx) return;
    preloadSectionThumbnails(index);
    const now = Date.now();
    startTransition(() => {
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
    });
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
        {/* One Suspense boundary per layer, not one shared boundary around
            the whole stack: textures now load lazily per-section, so an
            incoming layer can suspend while its thumbnails resolve. A
            shared boundary would blank the still-fully-loaded outgoing
            layer too, since Suspense replaces everything under the nearest
            boundary above the point of suspension. */}
        {gridLayers.map((layer) => (
          <Suspense key={layer.id} fallback={null}>
            <GalleryGrid
              items={layer.items}
              gridVisible={layer.mode === "enter"}
              transitionStartTime={layer.startTime}
              interactive={layer.mode === "enter"}
              focusedIndex={focusedIndex}
            />
          </Suspense>
        ))}
      </Canvas>
      <GalleryMiniMap
        gridDims={activeDims}
        rigState={rigState}
        config={CONFIG}
        totalItems={itemCount}
        isZoomedIn={isZoomedIn}
      />
      <GalleryBackButton />
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
