/**
 * One-off migration script: uploads the live site's raster photos (home
 * page hero + the CSS gallery-wall's 12 photos) to Vercel Blob and writes
 * data/site-images-manifest.json. Companion to
 * scripts/upload-gallery-images.ts, kept separate since this isn't
 * category-structured — it's a flat, named set of images each consumed by
 * a specific component (app/page.tsx, components/gallery-wall).
 *
 * Deliberately excludes every SVG in images/ (the about-page illustrations,
 * the gallery-wall's center poster, the social icons): they're vectors
 * with no responsive-sizing benefit from an image CDN, so they stay as
 * local static imports — see gallery-wall.tsx's own comment on exactly
 * this point for the SVG poster it already keeps local.
 *
 * Run manually: npm run upload-site-images
 * Requires BLOB_READ_WRITE_TOKEN in .env.local.
 *
 * IMPORTANT: app/page.tsx and components/features/gallery-wall/gallery-wall.tsx
 * are live, linked pages — unlike the gallery-lab migration, they'll show
 * broken images to real visitors if deployed before this script has been
 * run at least once. Run it (and verify locally) before shipping.
 *
 * Safe to re-run: addRandomSuffix is off and allowOverwrite is on. Also
 * safe to run after cleaning up already-uploaded source files from
 * images/ — a file in FILES that's no longer present locally is skipped
 * (with a warning) rather than crashing, and its existing manifest entry
 * is left untouched, since the manifest is merged into rather than
 * rebuilt from scratch.
 */
import { put } from "@vercel/blob";
import sharp from "sharp";
import fs from "fs";
import path from "path";

process.loadEnvFile(".env.local");

const IMAGES_DIR = "images";
const BLOB_PREFIX = "site";
const MANIFEST_PATH = "data/site-images-manifest.json";

// Explicit list rather than "every .jpg in images/" — this folder also
// holds SVGs that must NOT go through this path (see doc comment above).
const FILES = [
  // Replaces the old single hero-section-image.jpg (art-directed per
  // breakpoint instead of one image cropped via object-cover) — see
  // components/features/draggable-photo/draggable-photo.tsx.
  "home-page-default-image.jpg",
  "home-page-image-sm.jpg",
  "home-page-image-lg.jpg",
  "home-page-image-xl.jpg",
  "gallery-image-1.jpg",
  "gallery-image-2.jpg",
  "gallery-image-3.jpg",
  "gallery-image-4.jpg",
  "gallery-image-5.jpg",
  "gallery-image-6.jpg",
  "gallery-image-7.jpg",
  "gallery-image-8.jpg",
  "gallery-image-9.jpg",
  "gallery-image-10.jpg",
  "gallery-image-11.jpg",
  "gallery-image-12.jpg",
];

interface ManifestEntry {
  url: string;
  width: number;
  height: number;
}
type SiteImagesManifest = Record<string, ManifestEntry>;

async function run() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set (checked .env.local). Nothing was uploaded.",
    );
  }

  const manifest: SiteImagesManifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : {};

  for (const file of FILES) {
    const filePath = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping "${file}": not found in ${IMAGES_DIR}/`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) continue;

    const blob = await put(`${BLOB_PREFIX}/${file}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    const key = path.basename(file, path.extname(file));
    manifest[key] = {
      url: blob.url,
      width: metadata.width,
      height: metadata.height,
    };
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

run();
