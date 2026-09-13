import * as THREE from "three";
import { CONFIG } from "./gallery-config";

/**
 * Mutable rig/interaction state shared across the camera rig and every
 * tile, read and written directly inside useFrame loops. Deliberately not
 * React state: touching state 60x/second here would force React re-renders
 * for every tile on every frame. Ported from the reference's gridState.js.
 */
export interface RigState {
  target: THREE.Vector3;
  current: THREE.Vector3;
  velocity: THREE.Vector3;
  zoom: number;
  isDragging: boolean;
  activeId: number | null;
}

export const rigState: RigState = {
  target: new THREE.Vector3(0, 2, 0),
  current: new THREE.Vector3(0, 2, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  zoom: CONFIG.zoomOut,
  isDragging: false,
  activeId: null,
};

export interface GridDimensions {
  width: number;
  height: number;
}

export function calculateGridDimensions(count: number): GridDimensions {
  // Math.max(1, ...): an empty section (0 images — e.g. before
  // scripts/upload-gallery-images.ts has been run) would otherwise produce
  // a 0 height, and width/height feeds gallery-minimap.tsx's aspectRatio —
  // dividing by 0 there renders an invalid `Infinity` CSS value.
  const rows = Math.max(1, Math.ceil(count / CONFIG.gridCols));
  const spacing = CONFIG.itemSize + CONFIG.gap;
  return {
    width: CONFIG.gridCols * spacing,
    height: rows * spacing,
  };
}
