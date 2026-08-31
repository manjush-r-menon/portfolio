"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Content is visible by default (no JS / no IntersectionObserver support =
 * fully readable). Only after mount does it drop into a hidden state to be
 * progressively revealed on scroll, so nothing depends on the observer
 * firing to become visible.
 */
export function ScrollSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = mounted && !visible && !reduced;

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 20 : 0 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
