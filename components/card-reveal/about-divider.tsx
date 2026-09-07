"use client";

import clsx from "clsx";
import { useIsMobileScroll } from "@/utils/use-is-mobile-scroll";
import styles from "./card-reveal.module.css";

export function AboutDivider({
  sectionRef,
}: {
  sectionRef?: React.Ref<HTMLElement>;
}) {
  const isMobileScroll = useIsMobileScroll();

  // A full 100svh "keep scrolling" beat makes sense on desktop as a pause
  // between HeroScatter's scatter and PinnedReveal's pin — on mobile,
  // HeroScatter no longer renders anything before this (see its own doc
  // comment) and PinnedReveal falls back to its plain static layout, so
  // this would just be an extra empty screen of scroll between the case
  // studies and the actually-informative services section.
  if (isMobileScroll) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={clsx(styles.about, "-mx-6 sm:-mx-10 lg:-mx-16 xl:-mx-24")}
    >
      <h2 className="max-w-3xl text-center font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-tight font-medium">
        Keep scrolling — it gets good
      </h2>
    </section>
  );
}
