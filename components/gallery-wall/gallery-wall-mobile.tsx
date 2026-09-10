import Image from "next/image";
import { PHOTO_SECTIONS } from "@/components/gallery-lab/photo-data";
import { PillButton } from "@/components/pill-button/pill-button";

// One photo each from three of the gallery's four sections (skipping
// Drawings, the smallest) so the preview reads as a range rather than
// three shots from the same category.
const PREVIEW_SECTION_IDS = ["chaos_creative", "food", "memories"];

const previewPhotos = PREVIEW_SECTION_IDS.map((id) => {
  const section = PHOTO_SECTIONS.find((candidate) => candidate.id === id);
  const photo = section?.images[0];
  return photo && section ? { ...photo, sectionTitle: section.title } : null;
}).filter((photo): photo is NonNullable<typeof photo> => photo !== null);

// Static stand-in for GalleryWall on mobile — no frames, no drag, no
// hover-driven fragment animation (see tagline-gallery-entry.tsx), just
// three plain images and a link to the real gallery.
export function GalleryWallMobile() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="grid w-full grid-cols-3 gap-3">
        {previewPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={photo.src}
              alt={`${photo.sectionTitle} gallery preview`}
              fill
              sizes="33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <PillButton href="/gallery">View gallery</PillButton>
    </div>
  );
}
