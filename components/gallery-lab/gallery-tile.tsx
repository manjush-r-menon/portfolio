"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { CONFIG } from "./gallery-config";
import { rigState } from "./gallery-state";
import {
  GRID_THUMBNAIL_WIDTH,
  DETAIL_VIEW_WIDTH,
  getOptimizedSrc,
  type GalleryPhoto,
} from "./photo-data";
import { GalleryCloseButton } from "./gallery-close-button";
import "./gallery-tile-material";
import type { GalleryTileMaterialImpl } from "./gallery-tile-material";
import { useReducedMotion } from "@/utils/use-reduced-motion";

export interface MappedGalleryPhoto extends GalleryPhoto {
  index: number;
  randomDelay: number;
  basePos: { x: number; y: number };
}

interface GalleryTileProps {
  data: MappedGalleryPhoto;
  index: number;
  basePos: { x: number; y: number };
  gridVisible: boolean;
  transitionStartTime: number;
  interactive: boolean;
  gridHeight: number;
  // Polled from rigState.activeId into real React state one level up (see
  // gallery-scene.tsx) — the single source of truth for which tile's close
  // button renders, and (as of the Blob migration) which texture size it
  // requests. Deliberately NOT derived from rigState.activeId here at
  // render time: this component has no subscription to that mutable value,
  // so reading it directly in the render body would only update whenever
  // something else happens to re-render this tile, not reliably on every
  // focus change — which is exactly how stale/duplicate close buttons crept
  // in before. The imperative per-frame animation below still reads
  // rigState.activeId directly, which is correct there (useFrame runs every
  // frame regardless of React's render cycle).
  focusedIndex: number | null;
}

/**
 * Ported from the reference's ShoeTile.jsx: grid position + camera offset,
 * curvature, focus-mode scale/dim, enter/exit transition (driven by
 * gridVisible — true while its layer is the active/entering section, false
 * while it's an outgoing layer fading out after a section switch), hover,
 * and holographic shader uniform updates. No product copy, price, or
 * type/color filtering — this is a plain image gallery, not the shoe demo.
 */
export function GalleryTile({
  data,
  index,
  basePos,
  gridVisible,
  transitionStartTime,
  interactive,
  gridHeight,
  focusedIndex,
}: GalleryTileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const imageMaterialRef = useRef<GalleryTileMaterialImpl>(null);
  const [hovered, setHovered] = useState(false);
  // Reactive (see the focusedIndex prop doc above) — used here to request
  // the larger detail-size image only for the tile that's actually
  // focused, and the small grid-thumbnail size otherwise. Both sizes are
  // preloaded up front in gallery-scene.tsx, so this swap resolves from
  // cache rather than suspending on focus.
  const isFocused = focusedIndex === index;
  const texture = useTexture(
    getOptimizedSrc(data.src, isFocused ? DETAIL_VIEW_WIDTH : GRID_THUMBNAIL_WIDTH),
  );
  const reducedMotion = useReducedMotion();

  const focusZ = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const curveZ = useRef(0);
  const transitionZ = useRef(0);
  const transitionY = useRef(0);
  const isSleep = useRef(false);

  useLayoutEffect(() => {
    const normalizedY = gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;
    if (gridVisible && !reducedMotion) {
      transitionZ.current = CONFIG.enterStartZ;
      transitionY.current = normalizedY * CONFIG.enterSpreadY;
      if (imageMaterialRef.current)
        imageMaterialRef.current.uOpacity = CONFIG.enterStartOpacity;
      isSleep.current = false;
    } else {
      transitionZ.current = 0;
      transitionY.current = 0;
      if (imageMaterialRef.current) imageMaterialRef.current.uOpacity = 1;
    }
    // Intentionally mount-only: mirrors the reference's reset-on-mount behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every tile — grid thumbnail or focused detail view — is contained
  // within a fixed square "stage" (object-fit: contain, in DOM terms) so
  // an image is never scaled up past the max cell/focus size and never
  // overflows it. imageDims below is the actual (aspect-correct) rendered
  // size of the image mesh within that stage — i.e. the shrink-wrapped box
  // around the image itself, letterboxing on whichever axis is shorter.
  // The close button anchors to imageDims (not stageSize), so it hugs
  // whichever image is actually open: top-right of a wide landscape image
  // sits far right, top-right of a narrow portrait image sits much further
  // left, tracking the image's own edge rather than a fixed screen spot.
  const stageSize = CONFIG.itemSize * 0.9;
  // imageDims uses the known width/height (baked into photo-manifest.json
  // at build time) rather than waiting on the loaded texture's own image.
  const imageDims = useMemo(() => {
    const imgAspect = data.width / data.height;
    return imgAspect > 1
      ? { width: stageSize, height: stageSize / imgAspect }
      : { width: stageSize * imgAspect, height: stageSize };
  }, [data.width, data.height, stageSize]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || isSleep.current) return;

    // --- 1. Stagger Logic (reduced motion skips the fly-in/out entirely) ---
    const now = Date.now();
    const timeSinceTrigger = now - transitionStartTime;
    const staggerDelay = data.randomDelay || 0;
    const canTransition = reducedMotion || timeSinceTrigger > staggerDelay;

    // --- 2. Calculate Targets ---
    const normalizedY = gridHeight > 0 ? basePos.y / (gridHeight / 2) : 0;
    let targetTransitionOpacity = 1.0;
    let targetTransitionZ = 0;
    let targetTransitionY = 0;
    if (gridVisible) {
      if (canTransition) {
        targetTransitionOpacity = 1.0;
        targetTransitionZ = 0;
        targetTransitionY = 0;
      } else {
        targetTransitionOpacity = CONFIG.enterStartOpacity;
        targetTransitionZ = CONFIG.enterStartZ;
        targetTransitionY = normalizedY * CONFIG.enterSpreadY;
      }
    } else {
      if (canTransition) {
        targetTransitionOpacity = 0.0;
        targetTransitionZ = CONFIG.exitEndZ;
        targetTransitionY = normalizedY * CONFIG.exitSpreadY;
      } else {
        targetTransitionOpacity = 1.0;
        targetTransitionZ = 0;
        targetTransitionY = 0;
      }
    }

    // --- 3. Base Position ---
    const x = basePos.x + rigState.current.x;
    const y = basePos.y + rigState.current.y;

    // --- 4. Dynamic Culling ---
    const currentCull = CONFIG.cullDistance * (rigState.zoom / 8);
    const isPositionVisible =
      Math.abs(x) < currentCull && Math.abs(y) < currentCull;

    if (!gridVisible && targetTransitionOpacity < 0.01) {
      group.visible = false;
      isSleep.current = true;
      return;
    }
    if (!isPositionVisible && !(!gridVisible && canTransition)) {
      group.visible = false;
      return;
    }
    if (
      (imageMaterialRef.current?.uOpacity ?? 1) < 0.01 &&
      targetTransitionOpacity < 0.01
    ) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // --- 5. Curvature & Zoom ---
    const isZoomedIn = rigState.zoom <= CONFIG.zoomIn + 0.5;
    const maxZoom = CONFIG.zoomOut || 50;
    const zoomRatio = isZoomedIn
      ? 0
      : THREE.MathUtils.clamp(
          (rigState.zoom - CONFIG.zoomIn) / (maxZoom - CONFIG.zoomIn),
          0,
          1,
        );
    const smoothRatio = easing.cubic.inOut(zoomRatio);
    const distSq = x * x + y * y;
    const dist = Math.sqrt(distSq);
    const targetCurveZ = -distSq * CONFIG.curvatureStrength * smoothRatio;

    let rotX = 0;
    let rotY = 0;
    if (targetTransitionOpacity > 0.1) {
      const rotationIntensity = Math.min(dist * 0.4, 2.0) * smoothRatio;
      rotX =
        y * CONFIG.curvatureStrength * CONFIG.rotationStrength * rotationIntensity;
      rotY =
        -x * CONFIG.curvatureStrength * CONFIG.rotationStrength * rotationIntensity;
    }

    // --- 6. Interaction State ---
    const isFocusMode = rigState.activeId !== null;
    const isActive = rigState.activeId === index;
    const isHovered = hovered && interactive && !rigState.isDragging;
    let interactionScale = 1.0;
    let interactionOpacity = 1.0;
    let targetFocusZ = 0;
    if (isFocusMode) {
      if (isActive) {
        interactionScale = CONFIG.focusScale;
        interactionOpacity = 1.0;
        targetFocusZ = 2;
      } else {
        interactionScale = CONFIG.dimScale;
        interactionOpacity = CONFIG.dimOpacity;
        targetFocusZ = -0.5;
      }
    } else {
      interactionScale = isHovered ? 1.05 : 1.0;
      targetFocusZ = isHovered ? 0.5 : 0;
    }
    const finalOpacity = interactionOpacity * targetTransitionOpacity;

    // --- 7. Apply Animations ---
    easing.damp(group.scale, "x", interactionScale, 0.15, delta);
    easing.damp(group.scale, "y", interactionScale, 0.15, delta);
    easing.damp(focusZ, "current", targetFocusZ, 0.2, delta);
    easing.damp(curveZ, "current", targetCurveZ, 0.2, delta);
    easing.damp(
      transitionZ,
      "current",
      targetTransitionZ,
      CONFIG.transitionZDamp,
      delta,
    );
    easing.damp(
      transitionY,
      "current",
      targetTransitionY,
      CONFIG.transitionYDamp,
      delta,
    );
    group.position.set(
      x,
      y + transitionY.current,
      curveZ.current + focusZ.current + transitionZ.current,
    );
    easing.damp(rotationX, "current", rotX, 0.2, delta);
    easing.damp(rotationY, "current", rotY, 0.2, delta);
    group.rotation.set(rotationX.current, rotationY.current, 0);

    const material = imageMaterialRef.current;
    if (material) {
      material.uTime = state.clock.elapsedTime;
      const activeDamp = isActive ? 0.6 : 0.15;
      easing.damp(material, "uActive", isActive ? 1 : 0, activeDamp, delta);
      const opacityDamp = gridVisible
        ? CONFIG.enterOpacityDamp
        : CONFIG.exitOpacityDamp;
      easing.damp(material, "uOpacity", finalOpacity, opacityDamp, delta);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    if (rigState.isDragging) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    if (rigState.activeId === index) {
      rigState.activeId = null;
    } else {
      const isZoomedOut = rigState.zoom > CONFIG.zoomIn + 2;
      rigState.target.set(-basePos.x, -basePos.y, 0);
      rigState.activeId = index;
      if (isZoomedOut) {
        rigState.zoom = CONFIG.zoomIn;
      }
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <planeGeometry args={[imageDims.width * 1.1, imageDims.height * 1.1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[imageDims.width, imageDims.height, 16, 16]} />
        <galleryTileMaterial
          ref={imageMaterialRef}
          transparent
          uTexture={texture}
        />
      </mesh>
      <GalleryCloseButton
        isActive={isFocused}
        // Anchored exactly at the image's own rendered corner (imageDims,
        // not the fixed stage) — the button hugs whichever image is open.
        // The visible 12px gap is applied in gallery-close-button.tsx as a
        // fixed CSS pixel offset, not a world-unit inset here, so it stays
        // a literal 12px on screen regardless of image size or zoom.
        position={[imageDims.width / 2, imageDims.height / 2, 0.02]}
        onClose={() => {
          rigState.activeId = null;
        }}
      />
    </group>
  );
}
