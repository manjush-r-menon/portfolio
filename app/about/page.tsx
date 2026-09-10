"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { GalleryWallMobile } from "@/components/gallery-wall/gallery-wall-mobile";
import { ScrollPath } from "@/components/scroll-path/scroll-path";
import { ScrollPathMobile } from "@/components/scroll-path/scroll-path-mobile";
import {
  useIsMobileScroll,
  MOBILE_SCROLL_BREAKPOINT,
} from "@/utils/use-is-mobile-scroll";

export default function About() {
  const reduced = useReducedMotion();
  const isMobileScroll = useIsMobileScroll();
  // Defaults to the plain mobile layout on server + first client paint,
  // same posture as HorizontalScrollHome's `usePinned` — both ScrollPath's
  // ScrollTrigger and GalleryWall's hover/drag GSAP work (see
  // tagline-gallery-entry.tsx) have no business constructing on a touch
  // device, so this has to be a JS branch: a `hidden lg:block` CSS swap
  // would still mount them underneath. One shared decision for both
  // sections, rather than each re-deriving it, keeps them from ever
  // disagreeing about which breakpoint they're in mid-resize.
  const [showDesktop, setShowDesktop] = useState(false);

  useEffect(() => {
    // Reads matchMedia directly rather than trusting `isMobileScroll`
    // alone — that hook starts `false` and corrects itself in its own
    // effect one tick later, so this effect (which runs in the same
    // commit) would otherwise act on its stale initial value.
    const isMobile =
      isMobileScroll ||
      window.matchMedia(`(max-width: ${MOBILE_SCROLL_BREAKPOINT - 1}px)`)
        .matches;
    setShowDesktop(!isMobile);
  }, [isMobileScroll]);

  return (
    <div className="relative w-full">
      {showDesktop ? <ScrollPath /> : <ScrollPathMobile />}

      <div className="mt-24">
        {/* The old standalone "Gallery" heading is gone — the ScrollPath
            outro now sits directly above this and does that same
            introducing job as its own closing line (see ScrollPath's
            outro copy), so a second, bare label here would be redundant. */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        >
          {showDesktop ? <GalleryWall /> : <GalleryWallMobile />}
        </motion.div>
      </div>
    </div>
  );
}
