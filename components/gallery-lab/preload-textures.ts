import { useTexture } from "@react-three/drei";

/**
 * Fires useTexture.preload for a batch of URLs per animation frame instead
 * of every URL in the same tick — a section can hold up to 57 images, and
 * firing all of their texture requests synchronously the moment it becomes
 * active spikes concurrent network+decode work right when the user is
 * waiting on that section to appear. Paced ahead of GalleryGrid's own
 * 5-tiles-per-frame mount stagger (batchSize > 5), so a tile's texture is
 * normally already resolving — often resolved — by the time it actually
 * mounts, rather than the mount stagger ever having to wait on this queue.
 *
 * Deliberately kept out of photo-data.ts (which gallery-wall-mobile.tsx —
 * a plain next/image preview strip, not part of the R3F scene — also
 * imports for PHOTO_SECTIONS): pulling @react-three/drei into that shared
 * file would leak three.js into every route that renders the mobile
 * gallery preview, undoing the existing ssr:false code-split that keeps
 * R3F scoped to the actual /gallery route.
 */
export function preloadTexturesInBatches(
  urls: string[],
  batchSize = 12,
): void {
  let i = 0;
  function next() {
    urls.slice(i, i + batchSize).forEach((url) => useTexture.preload(url));
    i += batchSize;
    if (i < urls.length) requestAnimationFrame(next);
  }
  next();
}
