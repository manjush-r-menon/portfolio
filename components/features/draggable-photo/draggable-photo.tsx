"use client";

import { useEffect, useState, type RefObject } from "react";
import { getImageProps } from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useVelocity,
  useTransform,
} from "framer-motion";
import { matchesMobileScrollBreakpoint } from "@/utils/hooks/use-is-mobile-scroll";
import type { SiteImage } from "@/utils/site-images";

const PHOTO_SIZE_CLASS =
  "h-40 w-72 sm:h-44 sm:w-[28rem] lg:h-56 lg:w-[40rem] xl:h-60 xl:w-[48rem]";

/**
 * One image per breakpoint (art direction, not just responsive sizing) —
 * each entry is pre-cropped to that breakpoint's exact container ratio
 * (see PHOTO_SIZE_CLASS), so ResponsivePicture below can render it with
 * object-cover and never actually need to crop anything itself.
 */
export interface ResponsivePhotoSources {
  /** <640px */
  base: SiteImage;
  /** >=640px (Tailwind `sm`) */
  sm: SiteImage;
  /** >=1024px (Tailwind `lg`) */
  lg: SiteImage;
  /** >=1280px (Tailwind `xl`) */
  xl: SiteImage;
}

// Matches PHOTO_SIZE_CLASS's own widths at each breakpoint — accurate
// `sizes` since these are fixed-width containers, not fluid ones.
const SIZES = { base: "288px", sm: "448px", lg: "640px", xl: "768px" };

const PICTURE_IMG_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "50% 38%",
};

/**
 * Art-directed <picture>, built via next/image's getImageProps rather than
 * <Image fill>: fill only handles responsive SIZING of one source image,
 * but each breakpoint here has its own distinct crop (see
 * ResponsivePhotoSources), so the browser needs to choose between four
 * different source images based on viewport width, not just serve
 * different resolutions of the same one. <source> order matters — the
 * browser picks the first one whose `media` matches, so these must go
 * widest-first (an xl viewport also satisfies "min-width: 640px").
 */
function ResponsivePicture({
  sources,
  alt,
  draggableAttr,
}: {
  sources: ResponsivePhotoSources;
  alt: string;
  draggableAttr?: boolean;
}) {
  const common = { alt, priority: true };
  const {
    props: { srcSet: xlSrcSet },
  } = getImageProps({
    ...common,
    src: sources.xl.url,
    width: sources.xl.width,
    height: sources.xl.height,
    sizes: SIZES.xl,
  });
  const {
    props: { srcSet: lgSrcSet },
  } = getImageProps({
    ...common,
    src: sources.lg.url,
    width: sources.lg.width,
    height: sources.lg.height,
    sizes: SIZES.lg,
  });
  const {
    props: { srcSet: smSrcSet },
  } = getImageProps({
    ...common,
    src: sources.sm.url,
    width: sources.sm.width,
    height: sources.sm.height,
    sizes: SIZES.sm,
  });
  // The fallback <img>'s own attributes come from the smallest (base)
  // image — its srcSet is discarded here since it's never used as a
  // <source>; the base crop is what plain `src` falls back to when no
  // wider <source> matches.
  const {
    props: { srcSet: _baseSrcSet, ...baseImgProps },
  } = getImageProps({
    ...common,
    src: sources.base.url,
    width: sources.base.width,
    height: sources.base.height,
    sizes: SIZES.base,
  });

  return (
    <picture>
      <source media="(min-width: 1280px)" srcSet={xlSrcSet} />
      <source media="(min-width: 1024px)" srcSet={lgSrcSet} />
      <source media="(min-width: 640px)" srcSet={smSrcSet} />
      <img
        {...baseImgProps}
        alt={alt}
        style={PICTURE_IMG_STYLE}
        draggable={draggableAttr}
      />
    </picture>
  );
}

function DragMeLabel() {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute -top-7 left-0 inline-flex items-center gap-1.5 font-sans text-[11px] tracking-[0.08em] text-ink-dim uppercase"
    >
      <span className="pointer-events-none">
        DR<span className="text-accent">A</span>G ME
      </span>
    </motion.span>
  );
}

interface PhotoProps {
  sources: ResponsivePhotoSources;
  alt: string;
}

function StaticPhoto({ sources, alt }: PhotoProps) {
  return (
    <div className={`${PHOTO_SIZE_CLASS} relative overflow-hidden`}>
      <ResponsivePicture sources={sources} alt={alt} />
    </div>
  );
}

interface InteractivePhotoProps extends PhotoProps {
  /** Photo can be dragged anywhere within this element's bounds. */
  constraintsRef?: RefObject<HTMLElement | null>;
}

function InteractivePhoto({
  sources,
  alt,
  constraintsRef,
}: InteractivePhotoProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const velocityX = useVelocity(x);
  const velocityY = useVelocity(y);
  const speed = useTransform([velocityX, velocityY], (latest) => {
    const [vx, vy] = latest as number[];
    return Math.sqrt(vx * vx + vy * vy);
  });
  const blur = useTransform(speed, [0, 1200], [0, 6], { clamp: true });
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    // The label lives inside the same transformed element as the photo, so
    // it tracks the photo's current dragged position instead of staying
    // behind at the original spot. z-20 + relative so the dragged photo
    // (and its label) render in front of any page content it's dragged
    // over, matching how "picking something up" should look.
    <motion.div
      drag
      dragElastic={0.15}
      dragConstraints={constraintsRef}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      onDragStart={() => {
        setIsDragging(true);
        setIsPressed(false);
      }}
      onDragEnd={() => setIsDragging(false)}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      style={{ x, y }}
      className="relative z-20 w-fit cursor-grab touch-none active:cursor-grabbing"
    >
      <AnimatePresence>
        {!isDragging && <DragMeLabel />}
      </AnimatePresence>
      {/* data-cursor="drag" scoped to just the image box (not the label
          above it) so DualCursor's "drag me" ring only shows while
          hovering the actual photo. */}
      <motion.div
        data-cursor="drag"
        style={{ filter }}
        className={`${PHOTO_SIZE_CLASS} overflow-hidden`}
      >
        <motion.div
          animate={{ scale: isPressed ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative h-full w-full"
        >
          <ResponsivePicture sources={sources} alt={alt} draggableAttr={false} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function DraggablePhoto({
  sources,
  alt,
  constraintsRef,
}: InteractivePhotoProps) {
  // Starts static on both server and first client paint (no hydration
  // mismatch). Only upgrades to the draggable version after mount, and
  // only when the user hasn't asked for reduced motion and isn't on a
  // mobile-width viewport — dragging a photo around with a thumb doesn't
  // carry over the same way a mouse-driven interaction does, and the
  // floating "DRAG ME" label (which only ever renders in the interactive
  // version below) has nothing useful to say on a touch device anyway.
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduced && !matchesMobileScrollBreakpoint()) setInteractive(true);
  }, []);

  return interactive ? (
    <InteractivePhoto sources={sources} alt={alt} constraintsRef={constraintsRef} />
  ) : (
    <StaticPhoto sources={sources} alt={alt} />
  );
}
