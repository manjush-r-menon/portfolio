import type { Metadata } from "next";
import { GalleryExperience } from "@/components/gallery-lab/gallery-experience";

// Experimental, unlinked route — the real image gallery (4 sections:
// Chaos & Creative, Drawings, Food, Memories) built on the R3F shoe-grid's
// canvas/drag-pan/focus/shader machinery, with the shoe-demo commerce
// chrome removed (see components/gallery-lab). Not linked from anywhere in
// the live site yet.
export const metadata: Metadata = {
  title: "Gallery Lab (experimental)",
  robots: { index: false, follow: false },
};

export default function GalleryLabPage() {
  return <GalleryExperience />;
}
