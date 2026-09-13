"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { CONFIG } from "./gallery-config";
import { rigState } from "./gallery-state";

interface GalleryRigProps {
  gridW: number;
  gridH: number;
}

/**
 * Ported from the reference's Rig.jsx, unchanged: owns the camera, raw
 * pointer-based drag-panning (works for touch via the Pointer Events API),
 * and zoom damping. Kept outside the grid so it persists across grid
 * layout/collection changes.
 */
export function Rig({ gridW, gridH }: GalleryRigProps) {
  const { camera, gl } = useThree();
  const prevPos = useRef(new THREE.Vector3());
  const hasSetInitialZoom = useRef(false);

  useEffect(() => {
    if (!hasSetInitialZoom.current && rigState.zoom) {
      camera.position.z = rigState.zoom;
      hasSetInitialZoom.current = true;
    }
  }, [camera]);

  const getBounds = useCallback(() => {
    const dist = camera.position.z;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const vFov = (perspectiveCamera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
    const visibleWidth = visibleHeight * perspectiveCamera.aspect;
    const xLimit = Math.max(0, (gridW - visibleWidth) / 2 + 2);
    const yLimit = Math.max(0, (gridH - visibleHeight) / 2 + 2);
    return { x: xLimit, y: yLimit, visibleHeight };
  }, [camera, gridW, gridH]);

  useEffect(() => {
    const canvas = gl.domElement;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let initialRigX = 0;
    let initialRigY = 0;
    let maxDragDistance = 0;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      startY = e.clientY;
      initialRigX = rigState.target.x;
      initialRigY = rigState.target.y;
      maxDragDistance = 0;
      rigState.isDragging = false;
      canvas.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      maxDragDistance = Math.max(maxDragDistance, distance);
      const threshold = "ontouchstart" in window ? 15 : CONFIG.clickThreshold;
      if (maxDragDistance > threshold) {
        rigState.isDragging = true;
        rigState.activeId = null;
      }
      const { x: bx, y: by, visibleHeight } = getBounds();
      const sensitivity = (visibleHeight / window.innerHeight) * CONFIG.dragSpeed;
      let rawTargetX = initialRigX + dx * sensitivity;
      let rawTargetY = initialRigY - dy * sensitivity;

      if (rawTargetX > bx) rawTargetX = bx + (rawTargetX - bx) * CONFIG.dragResistance;
      if (rawTargetX < -bx)
        rawTargetX = -bx + (rawTargetX + bx) * CONFIG.dragResistance;
      if (rawTargetY > by) rawTargetY = by + (rawTargetY - by) * CONFIG.dragResistance;
      if (rawTargetY < -by)
        rawTargetY = -by + (rawTargetY + by) * CONFIG.dragResistance;

      const maxOvershoot = 3;
      rawTargetX = Math.max(-bx - maxOvershoot, Math.min(bx + maxOvershoot, rawTargetX));
      rawTargetY = Math.max(-by - maxOvershoot, Math.min(by + maxOvershoot, rawTargetY));

      rigState.target.set(rawTargetX, rawTargetY, 0);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      rigState.isDragging = false;
      canvas.style.cursor = "grab";
      if (rigState.activeId !== null) return;
      const { x: bx, y: by } = getBounds();
      const isZoomedOut = camera.position.z > CONFIG.zoomIn + 2;
      const snapX = isZoomedOut ? 0 : Math.max(-bx, Math.min(bx, rigState.target.x));
      const snapY = isZoomedOut ? 2 : Math.max(-by, Math.min(by, rigState.target.y));
      rigState.target.set(snapX, snapY, 0);
    };

    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, gridW, gridH, getBounds]);

  // Keyboard fallback for the pointer-only drag-pan/zoom above: arrow keys
  // pan by one grid cell, +/- zoom by a fixed step. Bound to `window`
  // rather than the canvas — this route is a full-screen, single-purpose
  // canvas overlay (see gallery-scene.tsx) with nothing else to tab to, so
  // requiring the (not natively focusable) canvas to hold focus first would
  // just be friction, not an accessibility win. Mutates the same rigState
  // the pointer handlers do, so panning/zooming this way gets the exact
  // same damped camera motion (see useFrame below) as a mouse drag.
  useEffect(() => {
    const panStep = CONFIG.itemSize + CONFIG.gap;
    const zoomStep = 3;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;

      switch (e.key) {
        case "ArrowUp":
          rigState.target.y += panStep;
          break;
        case "ArrowDown":
          rigState.target.y -= panStep;
          break;
        case "ArrowLeft":
          rigState.target.x -= panStep;
          break;
        case "ArrowRight":
          rigState.target.x += panStep;
          break;
        case "+":
        case "=":
          rigState.zoom = Math.max(CONFIG.zoomIn, rigState.zoom - zoomStep);
          break;
        case "-":
        case "_":
          rigState.zoom = Math.min(CONFIG.zoomOut, rigState.zoom + zoomStep);
          break;
        default:
          return;
      }
      e.preventDefault();
      const { x: bx, y: by } = getBounds();
      rigState.target.x = Math.max(-bx, Math.min(bx, rigState.target.x));
      rigState.target.y = Math.max(-by, Math.min(by, rigState.target.y));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getBounds]);

  useFrame((_, delta) => {
    easing.damp3(rigState.current, rigState.target, CONFIG.dampFactor, delta);
    easing.damp(camera.position, "z", rigState.zoom, CONFIG.zoomDamp, delta);
    rigState.velocity.copy(rigState.current).sub(prevPos.current);
    prevPos.current.copy(rigState.current);
    const zoomFactor = Math.min(1, CONFIG.zoomIn / rigState.zoom);
    const tiltX = rigState.velocity.y * CONFIG.tiltFactor * zoomFactor;
    const tiltY = -rigState.velocity.x * CONFIG.tiltFactor * zoomFactor;
    easing.damp(camera.rotation, "x", tiltX, 0.2, delta);
    easing.damp(camera.rotation, "y", tiltY, 0.2, delta);
  });

  return null;
}
