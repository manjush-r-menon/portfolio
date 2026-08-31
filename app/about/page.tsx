"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { ScrollPath } from "@/components/scroll-path/scroll-path";

export default function About() {
  const reduced = useReducedMotion();

  return (
    <div className="relative w-full">
      <ScrollPath />

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
          <GalleryWall />
        </motion.div>
      </div>
    </div>
  );
}
