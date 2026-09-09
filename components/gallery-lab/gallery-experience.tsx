"use client";

import dynamic from "next/dynamic";

// R3F/WebGL can't run server-side; ssr:false requires a client component
// boundary, which is why this tiny wrapper exists instead of dynamic-
// importing directly from the (server) page component. Matches this
// codebase's existing convention of scoping "use client" as narrowly as
// possible rather than marking whole route trees client-side.
const GalleryScene = dynamic(
  () => import("./gallery-scene").then((mod) => mod.GalleryScene),
  { ssr: false },
);

export function GalleryExperience() {
  return <GalleryScene />;
}
