"use client";

import { startTransition, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CONFIG } from "./gallery-config";
import { calculateGridDimensions } from "./gallery-state";
import { GalleryTile, type MappedGalleryPhoto } from "./gallery-tile";
import type { GalleryPhoto } from "./photo-data";

interface GalleryGridProps {
  items: GalleryPhoto[];
  gridVisible: boolean;
  transitionStartTime: number;
  interactive: boolean;
  focusedIndex: number | null;
}

/**
 * Ported from the reference's GridCanvas.jsx: renders a single grid layer
 * (one "layer" of gallery-scene.tsx's enter/exit stack, used when switching
 * between the 4 sections) with time-sliced mounting. No filter-position
 * math — this gallery has no filtering within a section.
 */
export function GalleryGrid({
  items,
  gridVisible,
  transitionStartTime,
  interactive,
  focusedIndex,
}: GalleryGridProps) {
  const { mappedItems, gridDims } = useMemo(() => {
    const spacing = CONFIG.itemSize + CONFIG.gap;
    const dims = calculateGridDimensions(items.length);
    const maxDelay = gridVisible ? CONFIG.enterStaggerDelay : CONFIG.exitStaggerDelay;
    const mapped: MappedGalleryPhoto[] = items.map((item, i) => {
      const col = i % CONFIG.gridCols;
      const row = Math.floor(i / CONFIG.gridCols);
      return {
        ...item,
        index: i,
        randomDelay: Math.random() * maxDelay,
        basePos: {
          x: col * spacing - dims.width / 2 + spacing / 2,
          y: -(row * spacing) + dims.height / 2 - spacing / 2,
        },
      };
    });
    return { mappedItems: mapped, gridDims: dims };
  }, [items, gridVisible]);

  // --- TIME-SLICED MOUNTING ---
  // Start with 0 items rendered for entering grids; add a few per frame to
  // avoid a GPU texture-upload spike. Exiting grids render everything
  // immediately since there's no need to stagger the mount itself.
  const [mountedCount, setMountedCount] = useState(
    gridVisible ? 0 : items.length,
  );
  useFrame(() => {
    if (mountedCount < mappedItems.length) {
      // Transition-wrapped: with textures now loading lazily (see
      // gallery-scene.tsx's preloadSectionThumbnails) rather than all
      // preloaded up front, a newly-mounted batch of tiles can suspend on
      // an unresolved texture. Without startTransition, that suspension
      // would show this layer's Suspense fallback (null) — hiding every
      // already-visible tile in this same layer, not just the new batch.
      // Inside a transition, React keeps the already-committed tiles on
      // screen and only adds the new batch once its textures resolve.
      startTransition(() => {
        setMountedCount((prev) => Math.min(prev + 5, mappedItems.length));
      });
    }
  });

  return (
    <>
      {mappedItems.map((item, i) => {
        if (i > mountedCount) return null;
        return (
          <GalleryTile
            key={item.id}
            data={item}
            index={item.index}
            basePos={item.basePos}
            gridVisible={gridVisible}
            transitionStartTime={transitionStartTime}
            interactive={interactive}
            gridHeight={gridDims.height}
            // Computed here rather than passing the raw focusedIndex
            // through: this way each tile's own prop value only changes
            // when ITS focus state actually flips, which is what lets
            // GalleryTile's React.memo skip re-rendering every other tile
            // on a focus toggle instead of seeing a "changed" prop on all
            // of them.
            isFocused={focusedIndex === item.index}
          />
        );
      })}
    </>
  );
}
