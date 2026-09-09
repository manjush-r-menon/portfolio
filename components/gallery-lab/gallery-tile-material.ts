import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";

/**
 * Ported from the reference's HoloCardMaterial + holocard.vert/.frag.
 * Shader source is kept as inline strings (rather than separate .vert/.frag
 * files loaded via raw-loader/glslify, as the reference project's Pages
 * Router + webpack config did) since this codebase builds with Turbopack
 * and has no raw-shader-loader configured — inlining avoids adding a
 * loader/config dependency for a single custom material.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uActive;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // "Breathing" - only when active
    float breath = sin(uTime * 2.0) * 0.015 * uActive;
    float scale = 1.0 + breath;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * scale, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uActive;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    vec3 baseColor = texColor.rgb;

    if (uActive < 0.01) {
      gl_FragColor = vec4(baseColor, texColor.a * uOpacity);
      return;
    }

    // Light band sweep - driven by uActive transition (0->1)
    float diagonal = (vUv.x * 0.8) + vUv.y;
    float sheenPos = uActive * 2.5;
    float sheenWidth = 0.5;

    float dist = abs(diagonal - sheenPos);
    float intensity = 1.0 - smoothstep(0.0, sheenWidth, dist);
    intensity = pow(intensity, 3.0);

    // Fade out the sheen as uActive approaches 1 (sweep complete)
    float sheenFade = 1.0 - smoothstep(0.7, 1.0, uActive);

    vec3 sheenColor = vec3(0.85, 0.92, 1.0) * intensity * 0.9 * sheenFade;
    vec3 finalColor = baseColor + sheenColor * texColor.a;

    gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
  }
`;

export const GalleryTileMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uOpacity: 1,
    uActive: 0,
  },
  vertexShader,
  fragmentShader,
);

extend({ GalleryTileMaterial });

export type GalleryTileMaterialImpl = InstanceType<typeof GalleryTileMaterial>;

declare module "@react-three/fiber" {
  interface ThreeElements {
    galleryTileMaterial: ThreeElement<typeof GalleryTileMaterial>;
  }
}
