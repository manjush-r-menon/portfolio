/**
 * One-off migration script: uploads the gallery's local images to Vercel
 * Blob and writes out data/gallery-manifest.json, which the app reads at
 * build/runtime instead of scanning a local images folder.
 *
 * Already run once — data/gallery-manifest.json is populated with real
 * Blob URLs, and the local processed copies this script originally read
 * from (public/photos/) have since been deleted, since the app no longer
 * serves images from there.
 *
 * To re-run this (e.g. to add more images later): SRC_ROOT below won't
 * resolve until public/photos/<category>/ exists again — regenerate it
 * from the untouched originals in reference/photos/ (HEIC conversion +
 * resize/recompress) before running this script.
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local. Safe to re-run:
 * addRandomSuffix is off and allowOverwrite is on, so re-running with the
 * same local files updates the same blob paths in place rather than
 * erroring or piling up duplicates.
 */
import { put } from "@vercel/blob";
import sharp from "sharp";
import fs from "fs";
import path from "path";

process.loadEnvFile(".env.local");

const SRC_ROOT = "public/photos";
const CATEGORIES = ["chaos_creative", "drawings", "food", "memories"] as const;
const BLOB_PREFIX = "gallery";
const MANIFEST_PATH = "data/gallery-manifest.json";

interface ManifestImage {
  url: string;
  width: number;
  height: number;
  filename: string;
}
type GalleryManifest = Record<string, ManifestImage[]>;

async function uploadCategory(category: string): Promise<ManifestImage[]> {
  const dir = path.join(SRC_ROOT, category);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  const results: ManifestImage[] = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const buffer = fs.readFileSync(filePath);

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) continue;

    const blobPath = `${BLOB_PREFIX}/${category}/${file}`;
    const blob = await put(blobPath, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    results.push({
      url: blob.url,
      width: metadata.width,
      height: metadata.height,
      filename: file,
    });
  }
  return results;
}

async function run() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set (checked .env.local). Nothing was uploaded.",
    );
  }

  const manifest: GalleryManifest = {};
  for (const category of CATEGORIES) {
    manifest[category] = await uploadCategory(category);
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

run();
