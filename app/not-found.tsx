"use client";

import { useRouter } from "next/navigation";
import { ErrorCube, type MarqueeSegment } from "@/components/error-cube/error-cube";
import { PillButton } from "@/components/pill-button/pill-button";

const NOT_FOUND_PHRASES: MarqueeSegment[] = [
  { pre: "You've", highlight: "wandered", post: "off the map." },
  { pre: "This page went", highlight: "missing", post: "somewhere." },
  { pre: "Nothing lives at this", highlight: "address", post: "." },
  { pre: "The trail runs", highlight: "cold", post: "right here." },
  { pre: "Looks like a", highlight: "broken", post: "link brought you here." },
  { pre: "This route doesn't", highlight: "exist", post: "." },
  { pre: "Someone", highlight: "moved", post: "this page, or it never was." },
  { pre: "Turn back before you get more", highlight: "lost", post: "." },
  { pre: "This corner of the site is", highlight: "empty", post: "." },
  { pre: "The page you", highlight: "wanted", post: "isn't here." },
  { pre: "Consider this a", highlight: "dead", post: "end." },
  { pre: "Nothing to see, just", highlight: "static", post: "." },
  { pre: "The map", highlight: "ends", post: "before this page." },
  { pre: "You've wandered past the edge of the", highlight: "known", post: "map." },
  { pre: "This link led", highlight: "nowhere", post: "." },
  { pre: "Better take the scenic route", highlight: "back", post: "." },
];

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative -mx-6 -mt-24 -mb-20 sm:-mx-10 sm:-mt-36 sm:-mb-16 lg:-mx-16 xl:-mx-24">
      <h1 className="sr-only">Page not found</h1>
      <ErrorCube phrases={NOT_FOUND_PHRASES} />
      <PillButton
        onClick={() => router.back()}
        className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2"
      >
        Go back
      </PillButton>
    </div>
  );
}
