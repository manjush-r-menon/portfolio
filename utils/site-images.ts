import siteImagesManifest from "@/data/site-images-manifest.json";

/**
 * The live site's raster photos (home page hero, gallery-wall's 12
 * photos), migrated to Vercel Blob for storage consistency with the
 * /lab/gallery images — see scripts/upload-site-images.ts. SVGs stay as
 * local static imports; they were deliberately excluded from that script.
 */
export interface SiteImage {
  url: string;
  width: number;
  height: number;
}

const manifest = siteImagesManifest as Record<string, SiteImage>;

export function getSiteImage(key: string): SiteImage {
  const image = manifest[key];
  if (!image) {
    throw new Error(
      `No site image found for "${key}" in data/site-images-manifest.json`,
    );
  }
  return image;
}
