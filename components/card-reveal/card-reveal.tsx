"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { HeroScatter } from "./hero-scatter";
import { AboutDivider } from "./about-divider";
import { PinnedReveal } from "./pinned-reveal";

export function CardRevealSequence() {
  const reduced = useReducedMotion();
  const aboutRef = useRef<HTMLElement>(null);

  return (
    <>
      <HeroScatter reduced={reduced} />
      <AboutDivider sectionRef={aboutRef} />
      <PinnedReveal reduced={reduced} aboutRef={aboutRef} />
    </>
  );
}
