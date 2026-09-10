"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorCube, type MarqueeSegment } from "@/components/error-cube/error-cube";
import { PillButton } from "@/components/pill-button/pill-button";

const ERROR_PHRASES: MarqueeSegment[] = [
  { pre: "Something", highlight: "broke", post: "back there." },
  { pre: "This page hit a", highlight: "snag", post: "." },
  { pre: "The gears", highlight: "slipped", post: "somewhere." },
  { pre: "An error", highlight: "crept", post: "into view." },
  { pre: "This route", highlight: "stumbled", post: "." },
  { pre: "Something went", highlight: "sideways", post: "." },
  { pre: "The page", highlight: "buckled", post: "under itself." },
  { pre: "Best to", highlight: "retreat", post: "for now." },
  { pre: "This corner of the site is", highlight: "unstable", post: "." },
  { pre: "Nothing to see, just", highlight: "static", post: "." },
  { pre: "Consider this a", highlight: "detour", post: "." },
  { pre: "Something", highlight: "cracked", post: "under the hood." },
  { pre: "The map", highlight: "glitched", post: "here." },
  { pre: "Better take the scenic route", highlight: "back", post: "." },
];

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative -mx-6 -mt-24 -mb-20 sm:-mx-10 sm:-mt-36 sm:-mb-16 lg:-mx-16 xl:-mx-24">
      <h1 className="sr-only">Something went wrong</h1>
      <ErrorCube phrases={ERROR_PHRASES} />
      <PillButton
        onClick={() => router.back()}
        className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2"
      >
        Go back
      </PillButton>
    </div>
  );
}
