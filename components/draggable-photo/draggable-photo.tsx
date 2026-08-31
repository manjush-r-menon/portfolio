"use client";

import { useEffect, useState, type RefObject } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useVelocity,
  useTransform,
} from "framer-motion";

const PHOTO_SIZE_CLASS =
  "h-40 w-72 sm:h-44 sm:w-[28rem] lg:h-56 lg:w-[40rem] xl:h-60 xl:w-[48rem]";

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

function StaticPhoto({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <div className={`${PHOTO_SIZE_CLASS} overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{ objectPosition: "50% 38%" }}
        priority
        sizes="640px"
      />
    </div>
  );
}

function InteractivePhoto({
  src,
  alt,
  constraintsRef,
}: {
  src: StaticImageData;
  alt: string;
  constraintsRef?: RefObject<HTMLElement | null>;
}) {
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
          className="h-full w-full"
        >
          <Image
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 38%" }}
            priority
            sizes="640px"
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function DraggablePhoto({
  src,
  alt,
  constraintsRef,
}: {
  src: StaticImageData;
  alt: string;
  /** Photo can be dragged anywhere within this element's bounds. */
  constraintsRef?: RefObject<HTMLElement | null>;
}) {
  // Starts static on both server and first client paint (no hydration
  // mismatch). Only upgrades to the draggable version after mount, and
  // only when the user hasn't asked for reduced motion.
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!reduced) setInteractive(true);
  }, []);

  return interactive ? (
    <InteractivePhoto src={src} alt={alt} constraintsRef={constraintsRef} />
  ) : (
    <StaticPhoto src={src} alt={alt} />
  );
}
