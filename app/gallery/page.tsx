import type { Metadata } from "next";
import { GalleryExperience } from "@/components/gallery-lab/gallery-experience";

// The real image gallery (4 sections: Chaos & Creative, Drawings, Food,
// Memories) built on the R3F shoe-grid's canvas/drag-pan/focus/shader
// machinery, with the shoe-demo commerce chrome removed (see
// components/gallery-lab). Linked from the About page's tagline hover
// (see components/gallery-wall/tagline-gallery-entry.tsx).
export const metadata: Metadata = {
  title: "Gallery Lab (experimental)",
  robots: { index: false, follow: false },
};

export default function GalleryPage() {
  return <GalleryExperience />;
}
