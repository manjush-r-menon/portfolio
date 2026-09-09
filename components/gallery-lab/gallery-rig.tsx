"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const canvas = gl.domElement;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let initialRigX = 0;
    let initialRigY = 0;
    let maxDragDistance = 0;

    const getBounds = () => {
      const dist = camera.position.z;
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const vFov = (perspectiveCamera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
      const visibleWidth = visibleHeight * perspectiveCamera.aspect;
      const xLimit = Math.max(0, (gridW - visibleWidth) / 2 + 2);
      const yLimit = Math.max(0, (gridH - visibleHeight) / 2 + 2);
      return { x: xLimit, y: yLimit, visibleHeight };
    };

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
  }, [gl, camera, gridW, gridH]);

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
