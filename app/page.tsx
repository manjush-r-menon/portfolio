"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { TextReveal } from "@/components/text-reveal/text-reveal";
import { IndexLabel } from "@/components/index-label/index-label";
import { IdleIconPair } from "@/components/idle-icons/idle-icon-pair";
import { AmbientShape } from "@/components/ambient-shape/ambient-shape";
import { DraggablePhoto } from "@/components/draggable-photo/draggable-photo";
import { PillButton } from "@/components/pill-button/pill-button";
import { ArrowIcon } from "@/components/icon-components/arrow-icon";
import { HorizontalScrollHome } from "@/components/horizontal-scroll/horizontal-scroll-home";
import { SecretReveal } from "@/components/secret-reveal/secret-reveal";
import {
  BlogMarquee,
  BLOG_MARQUEE_PIN_VH,
  BLOG_MARQUEE_PIN_PAUSE_MS,
  getBlogMarqueePinVh,
  pxToPinVh,
} from "@/components/blog-marquee/blog-marquee";
import heroImage from "@/images/hero-section-image.png";

const INSTRUMENTS = [
  { word: "REACT", accent: true },
  { word: "TYPESCRIPT", accent: false },
  { word: "NEXT.JS", accent: false },
] as const;

export default function Home() {
  const reduced = useReducedMotion();
  const sectionOneRef = useRef<HTMLDivElement>(null);
  // Progress (vh) through the blog-marquee slide's pin window — written by
  // PinnedTrack as the user scrolls, read by BlogMarquee to drive its cards
  // 1:1 with genuine scroll input instead of an ambient timer. See both
  // components' doc comments for why.
  const blogMarqueePinScroll = useMotionValue(0);
  // Real, measured exit ratio (0-1) of the marquee's last real card —
  // written by BlogMarquee every frame, read by PinnedTrack as the
  // authoritative release trigger instead of a scroll-distance estimate.
  // See PinnedTrack's `releaseGateRatio` doc comment.
  const blogMarqueeExitRatio = useMotionValue(0);
  // Real measured px distance (last real card's offset + width + one
  // buffer card-unit), reported once BlogMarquee's cards have laid out.
  // Combined with the real viewport height below to size the pin's
  // reserved scroll distance exactly, instead of trusting a hardcoded
  // card-width guess to still match whatever the cards actually render at.
  const [measuredExitPx, setMeasuredExitPx] = useState<number | null>(null);
  // BLOG_MARQUEE_PIN_VH is computed against an assumed viewport height for
  // SSR/first paint (no `window` yet); swapped for the real height right
  // after mount so the reserved scroll budget actually matches this
  // device's viewport instead of silently drifting on anything shorter
  // than the assumption — see getBlogMarqueePinVh's doc comment.
  const [viewportHeightPx, setViewportHeightPx] = useState<number | null>(
    null
  );
  useEffect(() => {
    setViewportHeightPx(window.innerHeight);
  }, []);
  // Real measurement wins the moment it's available; the estimate is only
  // ever the fallback ceiling until then (and the ceiling PinnedTrack falls
  // back on if the real ratio somehow never reaches 1) — see
  // getBlogMarqueePinVh's doc comment for why the estimate alone isn't
  // trusted to decide the release point anymore.
  const blogMarqueePinVh =
    measuredExitPx !== null && viewportHeightPx !== null
      ? pxToPinVh(measuredExitPx, viewportHeightPx)
      : viewportHeightPx !== null
        ? getBlogMarqueePinVh(viewportHeightPx)
        : BLOG_MARQUEE_PIN_VH;
  const t = (duration: number, delay = 0) => ({
    duration: reduced ? 0 : duration,
    delay: reduced ? 0 : delay,
    ease: "easeOut" as const,
  });

  const section1 = (
    <div
      ref={sectionOneRef}
      className="grid min-h-[68vh] w-full grid-cols-1 gap-10 sm:min-h-[72vh] md:grid-cols-2 md:gap-16"
    >
      <div className="flex flex-col justify-between">
        <div>
          <IndexLabel index="01" />
          <p className="mt-4 inline-flex items-center gap-2 font-sans text-sm font-medium tracking-[0.06em] text-ink uppercase">
            <TextReveal delay={0}>
              <span>From India, with love</span>
            </TextReveal>
          </p>
        </div>

        <SecretReveal className="max-w-xs">
          <span className="font-bold">You found my one real skill: </span>
          Hiding things well
        </SecretReveal>

        <h1 className="grotesk-display text-[clamp(3rem,8vw,7rem)]">
          Manjush
          <br />
          Menon
        </h1>
      </div>

      <div className="flex flex-col items-start gap-5">
        <p
          className="grotesk-display relative self-end text-right text-[clamp(2.75rem,7vw,6.5rem)]"
          style={{ fontWeight: 400 }}
        >
          <span className="block">
            Frontend
            <br />
            Developer
          </span>
        </p>

        <motion.div
          className="relative mt-6"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={t(0.5, 0.3)}
        >
          <DraggablePhoto
            src={heroImage}
            alt="Manjush R Menon"
            constraintsRef={sectionOneRef}
          />
        </motion.div>

        <div className="flex items-start gap-4 font-sans text-sm font-semibold tracking-[0.02em] text-ink uppercase">
          <ArrowIcon className="mt-1 h-5 w-5 shrink-0" />
          <TextReveal delay={0.45}>
            <span className="leading-[1.5]">
              Based in
              <br />
              Kochi, India,
              <br />
              open to remote work
            </span>
          </TextReveal>
        </div>
      </div>
    </div>
  );

  const section2Content = (
    <div className="relative flex min-h-[60vh] w-full flex-col justify-center">
      <AmbientShape variant="neutral" className="-left-24 top-1/3 -z-10" />
      <IndexLabel index="02" />
      <p className="mt-4 max-w-sm font-sans text-[15px] leading-[1.7] text-ink-dim">
        I build the interfaces behind fast, accessible products.
      </p>
      <div className="mt-4 flex flex-col">
        {INSTRUMENTS.map((item) => (
          <span
            key={item.word}
            className="grotesk-display text-[clamp(3rem,10vw,8.5rem)]"
            style={item.accent ? { color: "var(--accent)" } : undefined}
          >
            {item.word}
          </span>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        <IdleIconPair />
        <PillButton href="/about">More about me</PillButton>
      </div>
    </div>
  );

  const section3Content = (
    <div className="flex min-h-[55vh] w-full flex-col justify-center">
      <IndexLabel index="03" large />
      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h2 className="grotesk-display text-[clamp(2.5rem,6vw,4.5rem)]">
          <span className="block">Payment</span>
          <span className="block">module</span>
        </h2>
        <p className="flex max-w-sm items-start gap-3 font-sans text-[15px] leading-[1.7] text-ink-dim">
          <ArrowIcon className="mt-1 h-4 w-4 shrink-0" />
          <span>
            Owned the payment module for an artist marketplace, end to end —
            from requirements to a shipped, tested feature.
          </span>
        </p>
      </div>
      <PillButton href="/work" className="mt-10 self-start">
        View work
      </PillButton>
    </div>
  );

  const blogMarqueeContent = (
    <div className="flex min-h-[60vh] w-full flex-col justify-center">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:items-center md:gap-12">
        <div>
          <IndexLabel index="04" />
          <h2 className="grotesk-display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
            <span className="block">From the</span>
            <span className="block">blog</span>
          </h2>
          <p className="mt-4 max-w-xs font-sans text-[15px] leading-[1.7] text-ink-dim">
            A running list of what I&apos;ve been writing about. Keep
            scrolling to move through them.
          </p>
        </div>
        <BlogMarquee
          pinScrollVh={blogMarqueePinScroll}
          exitRatio={blogMarqueeExitRatio}
          onMeasuredExitPx={setMeasuredExitPx}
        />
      </div>
    </div>
  );

  const section4Content = (
    <div className="relative flex min-h-[60vh] w-full flex-col justify-center">
      <AmbientShape
        variant="accent"
        className="top-1/2 right-0 -z-10 -translate-y-1/2"
      />
      <IndexLabel index="05" />
      <p className="mt-6 max-w-2xl font-display text-2xl text-ink italic sm:text-3xl">
        Most of what I build and most of what I shoot start the same way —
        paying attention to the small stuff.
      </p>
      <div className="mt-8 overflow-hidden">
        <span className="grotesk-display line-mask block text-[clamp(3.5rem,11vw,9.5rem)] whitespace-nowrap">
          Manjush Menon
        </span>
      </div>
      <PillButton href="/contact" className="mt-10 self-start">
        Get in touch
      </PillButton>
    </div>
  );

  const panelWrapClass = "w-full px-6 sm:px-10 lg:px-16 xl:px-24";

  const panels = [
    {
      key: "intro",
      content: <div className={panelWrapClass}>{section1}</div>,
    },
    {
      key: "instruments",
      content: <div className={panelWrapClass}>{section2Content}</div>,
    },
    {
      key: "work-teaser",
      content: <div className={panelWrapClass}>{section3Content}</div>,
    },
    {
      key: "blog-marquee",
      content: <div className={panelWrapClass}>{blogMarqueeContent}</div>,
    },
    {
      key: "closing",
      content: <div className={panelWrapClass}>{section4Content}</div>,
    },
  ];

  // The marquee needs to hold still on screen for a stretch so its peel
  // effect doesn't freeze mid-flight while being carried past by the
  // track's own transform (see PinnedTrack's doc comment) — looked up by
  // key rather than hardcoded so this stays correct if the panel order
  // ever changes.
  const blogMarqueeIndex = panels.findIndex((p) => p.key === "blog-marquee");

  return (
    <div className="-mx-6 -mt-28 -mb-20 sm:-mx-10 sm:-mt-36 sm:-mb-16 lg:-mx-16 xl:-mx-24">
      <HorizontalScrollHome
        panels={panels}
        pinIndex={blogMarqueeIndex >= 0 ? blogMarqueeIndex : undefined}
        pinVh={blogMarqueePinVh}
        pinScrollVh={blogMarqueePinScroll}
        releaseGateRatio={blogMarqueeExitRatio}
        pinPauseMs={BLOG_MARQUEE_PIN_PAUSE_MS}
      />
    </div>
  );
}
