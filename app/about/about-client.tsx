"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/utils/hooks/use-reduced-motion";
import {
  useIsMobileScroll,
  matchesMobileScrollBreakpoint,
} from "@/utils/hooks/use-is-mobile-scroll";

interface AboutClientProps {
  desktopPath: ReactNode;
  mobilePath: ReactNode;
  desktopGallery: ReactNode;
  mobileGallery: ReactNode;
}

export function AboutClient({
  desktopPath,
  mobilePath,
  desktopGallery,
  mobileGallery,
}: AboutClientProps) {
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
    const isMobile = isMobileScroll || matchesMobileScrollBreakpoint();
    setShowDesktop(!isMobile);
  }, [isMobileScroll]);

  return (
    <div className="relative w-full">
      {showDesktop ? desktopPath : mobilePath}

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
          {showDesktop ? desktopGallery : mobileGallery}
        </motion.div>
      </div>
    </div>
  );
}
