"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { TransitionLink } from "@/components/page-transition/transition-link";
import { ArrowIcon } from "@/components/icon-components/arrow-icon";
import {
  CARD_REVEAL_CATEGORIES,
  type CardRevealCategory,
} from "@/data/card-reveal-data";
import styles from "./card-reveal.module.css";

gsap.registerPlugin(ScrollTrigger);

const smoothStep = (p: number) => p * p * (3 - 2 * p);
// Single source of truth — rendered in both the static and animated
// header markup below, so a future copy change only needs to happen once.
const SERVICES_HEADER_TEXT = "Stuff I learned so you don’t have to Google it";
// Clear space below the cards' actual (measured) bottom edge before the
// CTA starts — see the comment where this is used for why it's measured
// dynamically instead of a fixed `bottom` CSS offset.
const CTA_GAP_PX = 24;

const DECK_CLASSES = [styles.cardDeck1, styles.cardDeck2, styles.cardDeck3];
const FRONT_CLASSES = [
  styles.flipCardFront1,
  styles.flipCardFront2,
  styles.flipCardFront3,
];
const BACK_CLASSES = [
  styles.flipCardBack1,
  styles.flipCardBack2,
  styles.flipCardBack3,
];
const DELAY_CLASSES = [styles.delay0, styles.delay1, styles.delay2];

// Lenis (the site-wide smooth-scroll layer, see SmoothScrollProvider) caps
// how far wheel-driven scrolling can go using a `limit` it recalculates via
// a ResizeObserver on document.documentElement. That observer fires when
// <html>'s own layout box changes size — NOT when a descendant's overflow
// changes document.scrollHeight, which is exactly what toggling
// .cardsLayer between fixed and absolute does (measured: scrollHeight
// 7138px -> 7160px right as the pin releases and applyAbsolute repositions
// it). Lenis never notices, so it keeps clamping wheel scroll to the stale
// (smaller) limit — real scrollTo() still reaches the true bottom, but
// real mouse-wheel/trackpad input hits an invisible wall and produces
// nothing, which reads exactly like "several scrolls of dead nothing".
// Lenis's `wrapper` defaults to `window` and it already listens for the
// native `resize` event (debounced 250ms) as a second recalculation path
// independent of the ResizeObserver — dispatching one synthetically here
// is the same signal a real window resize would send, and is how GSAP
// ScrollTrigger itself expects to be nudged after programmatic layout
// changes it didn't cause directly.
function notifyLayoutChanged() {
  window.dispatchEvent(new Event("resize"));
}

function applyFixed(layer: HTMLDivElement) {
  gsap.set(layer, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  });
  notifyLayoutChanged();
}

function applyAbsolute(layer: HTMLDivElement, servicesEl: HTMLElement) {
  const rect = servicesEl.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  gsap.set(layer, {
    position: "absolute",
    top,
    left: 0,
    width: "100vw",
    height: "100vh",
  });
  notifyLayoutChanged();
}

// The reference masks its cards behind the black "about" section purely
// through paint order: `.cards` sits at z-index:-1, so `.about`'s own
// opaque background naturally occludes it for as long as any part of
// `.about` still overlaps the viewport — no explicit clip/overflow at all.
// We can't use a negative z-index here (the portaled .cardsLayer needs to
// stay above the rest of the real page, see the integration notes), so we
// reproduce the same *effect* directly: clip .cardsLayer's own box to
// never extend above wherever .about's bottom edge currently sits on
// screen. Once .about has fully scrolled past, this clips nothing.
function applyAboutClip(layer: HTMLDivElement, aboutEl: HTMLElement | null) {
  if (!aboutEl) {
    layer.style.clipPath = "";
    return;
  }
  const aboutRect = aboutEl.getBoundingClientRect();
  const layerRect = layer.getBoundingClientRect();
  const clipTop = Math.max(0, Math.round(aboutRect.bottom - layerRect.top));
  layer.style.clipPath =
    clipTop > 0 ? `inset(${clipTop}px 0 0 0)` : "inset(0 0 0 0)";
}

function CtaButton() {
  return (
    <TransitionLink
      href="/certifications"
      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-bg transition-colors hover:bg-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
    >
      View certifications
      <ArrowIcon className="h-4 w-4 shrink-0" />
    </TransitionLink>
  );
}

function FlipCard({
  category,
  index,
  variant,
  outerRef,
  innerRef,
}: {
  category: CardRevealCategory;
  index: number;
  variant: "animated" | "static";
  outerRef?: (el: HTMLDivElement | null) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const isAnimated = variant === "animated";

  return (
    <div
      ref={outerRef}
      className={clsx(
        isAnimated ? styles.card : styles.cardStatic,
        isAnimated && DECK_CLASSES[index]
      )}
    >
      <div
        className={clsx(
          isAnimated ? styles.cardWrapper : styles.cardWrapperStatic,
          isAnimated && DELAY_CLASSES[index]
        )}
      >
        <div
          ref={innerRef}
          className={styles.flipCardInner}
          style={!isAnimated ? { transform: "rotateY(180deg)" } : undefined}
        >
          <div className={clsx(styles.flipCardFront, FRONT_CLASSES[index])}>
            <div className={styles.cardTitleRow}>
              <span>{category.issuer}</span>
              <span>{category.index}</span>
            </div>
            <div className={styles.cardTitleRow}>
              <span>{category.index}</span>
              <span>{category.issuer}</span>
            </div>
          </div>
          <div className={clsx(styles.flipCardBack, BACK_CLASSES[index])}>
            <div className={styles.cardTitleRow}>
              <span>{category.issuer}</span>
              <span>{category.index}</span>
            </div>
            <div className={styles.certContent}>
              <h3 className={styles.certTitle}>{category.title}</h3>
              <p className={styles.certMeta}>
                {category.issuer} · {category.date}
              </p>
              <p className={styles.certDescription}>{category.description}</p>
            </div>
            <div className={styles.cardTitleRow}>
              <span>{category.index}</span>
              <span>{category.issuer}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PinnedReveal({
  reduced,
  aboutRef,
}: {
  reduced: boolean;
  aboutRef: React.RefObject<HTMLElement | null>;
}) {
  // Starts "static" on both server and first client paint (matches the
  // codebase's SSR-safe reduced-motion pattern, see DraggablePhoto) — only
  // upgrades to the animated/portaled version once a client effect confirms
  // desktop width + no reduced-motion preference.
  const [mode, setMode] = useState<"static" | "animated">("static");
  const [inView, setInView] = useState(false);

  const servicesRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsLayerRef = useRef<HTMLDivElement>(null);
  const cardsAndHeaderRef = useRef<HTMLDivElement>(null);
  const cardOuterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);
  const driverTriggerRef = useRef<ScrollTrigger | null>(null);
  const applyDriverProgressRef = useRef<((progress: number) => void) | null>(
    null
  );

  useEffect(() => {
    // `reduced` is a prop sourced from a hook that starts `false` and
    // corrects itself in its own effect one tick later — since effects run
    // children-first, this effect can otherwise fire BEFORE that
    // correction lands, briefly deciding "animated" for a user who actually
    // has reduced motion on and creating a real pin (with its DOM-mutating
    // spacer) before self-correcting. Reading matchMedia directly here
    // sidesteps the lag; `reduced` stays in the dependency array so a live
    // OS-setting toggle still re-runs this.
    const prefersReduced =
      reduced ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (prefersReduced || window.innerWidth <= 1000) {
      setMode("static");
    } else {
      setMode("animated");
    }
  }, [reduced]);

  useGSAP(
    () => {
      if (mode !== "animated" || !servicesRef.current) return;

      const servicesEl = servicesRef.current;
      // `driver` (below) starts 1 viewport-height before the pin — at
      // 'top bottom' instead of 'top top' — so its own +4vh range ends
      // exactly 1vh *before* the pin's `end: +4vh` would. Every card/header
      // animation finishes at driver-progress 1.0, i.e. at that earlier
      // point — so a pin ending a full extra vh later was pure dead scroll:
      // the section stayed pinned for a whole additional screen's worth of
      // scrolling after the CTA had already fully faded in (measured at
      // 945px / 1.05vh before this fix). Ending the pin at +3vh instead
      // makes it release at exactly the same scroll position driver's own
      // range ends, closing that gap outright rather than trimming it.
      const pinEndValue = () => `+=${window.innerHeight * 3}`;
      const endValue = () => `+=${window.innerHeight * 4}`;

      const pinAndToggle = ScrollTrigger.create({
        trigger: servicesEl,
        start: "top top",
        end: pinEndValue,
        pin: servicesEl,
        pinSpacing: true,
        onEnter: () => cardsLayerRef.current && applyFixed(cardsLayerRef.current),
        onEnterBack: () =>
          cardsLayerRef.current && applyFixed(cardsLayerRef.current),
        onLeave: () =>
          cardsLayerRef.current &&
          applyAbsolute(cardsLayerRef.current, servicesEl),
        onLeaveBack: () =>
          cardsLayerRef.current &&
          applyAbsolute(cardsLayerRef.current, servicesEl),
      });
      pinTriggerRef.current = pinAndToggle;

      // Widened to control when the fixed cards layer is mounted at all —
      // from just before the section enters, through the full pin duration,
      // plus a 1vh buffer past pin release (the pin now releases at exactly
      // the same point driver's own range ends, so this buffer just avoids
      // unmounting the portal on the very same tick the pin lets go — a
      // little breathing room for a smooth scroll-away, not compensating
      // for a timing gap the way the old +8vh had to). Kept separate from
      // `driver` below so the driver's own scroll-progress math stays an
      // exact match for the reference.
      const visibility = ScrollTrigger.create({
        trigger: servicesEl,
        start: "top bottom",
        end: () => `+=${window.innerHeight * 5}`,
        onToggle: (self) => setInView(self.isActive),
      });

      function applyDriverProgress(progress: number) {
          if (cardsAndHeaderRef.current) {
            applyAboutClip(cardsAndHeaderRef.current, aboutRef.current);
          }

          const headerProgress = gsap.utils.clamp(0, 1, progress / 0.9);
          // headerRef mounts inside the portal, one render tick behind
          // `visibility`'s onToggle flipping `inView` — null-guard the
          // handful of frames where it hasn't landed yet.
          if (headerRef.current) {
            gsap.set(headerRef.current, {
              y: gsap.utils.interpolate("400%", "0%", smoothStep(headerProgress)),
            });
          }

          [0, 1, 2].forEach((index) => {
            const outer = cardOuterRefs.current[index];
            const inner = innerCardRefs.current[index];
            if (!outer || !inner) return;

            const delay = index * 0.5;
            const cardProgress = gsap.utils.clamp(
              0,
              1,
              (progress - delay * 0.1) / (0.9 - delay * 0.1)
            );

            let y: string;
            if (cardProgress < 0.4) {
              y = gsap.utils.interpolate(
                "-100%",
                "50%",
                smoothStep(cardProgress / 0.4)
              );
            } else if (cardProgress < 0.6) {
              y = gsap.utils.interpolate(
                "50%",
                "0%",
                smoothStep((cardProgress - 0.4) / 0.2)
              );
            } else {
              y = "0%";
            }

            let scale: number;
            if (cardProgress < 0.4) {
              scale = gsap.utils.interpolate(
                0.25,
                0.75,
                smoothStep(cardProgress / 0.4)
              );
            } else if (cardProgress < 0.6) {
              scale = gsap.utils.interpolate(
                0.75,
                1,
                smoothStep((cardProgress - 0.4) / 0.2)
              );
            } else {
              scale = 1;
            }

            // No fade-in — cards are fully opaque throughout; the
            // about-section clip-path (applyAboutClip) is what keeps them
            // hidden until they've scrolled clear of it, not opacity.
            const opacity = 1;

            const baseX = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
            const baseRotate = index === 0 ? -5 : index === 1 ? 0 : 5;

            let x: string;
            let rotate: number;
            let rotationY: number;

            if (cardProgress < 0.6) {
              x = baseX;
              rotate = baseRotate;
              rotationY = 0;
            } else if (cardProgress < 1) {
              const normalizedProgress = (cardProgress - 0.6) / 0.4;
              x = gsap.utils.interpolate(baseX, "0%", smoothStep(normalizedProgress));
              rotate = gsap.utils.interpolate(
                baseRotate,
                0,
                smoothStep(normalizedProgress)
              );
              rotationY = smoothStep(normalizedProgress) * 180;
            } else {
              x = "0%";
              rotate = 0;
              rotationY = 180;
            }

            gsap.set(outer, { opacity, y, x, rotate, scale });
            gsap.set(inner, { rotationY });
          });

          // Cards finish landing (all three) at progress === 0.9. Fade/
          // scale the CTA in over the tail end, 0.85 -> 1, so it settles in
          // right alongside the cards rather than waiting for the pin's
          // dead-zone. Positioned from the cards' own *measured* bottom
          // edge (read after the gsap.set calls above, so it reflects
          // their current rotation/scale) rather than a fixed `bottom`
          // offset from the viewport — a fixed offset only happens to
          // clear the cards at one specific viewport height, since the
          // cards' vertical center is itself viewport-height-dependent.
          if (ctaRef.current && cardsLayerRef.current) {
            const layerTop = cardsLayerRef.current.getBoundingClientRect().top;
            const cardBottoms = cardOuterRefs.current
              .filter((el): el is HTMLDivElement => el !== null)
              .map((el) => el.getBoundingClientRect().bottom);
            if (cardBottoms.length > 0) {
              const maxCardBottom = Math.max(...cardBottoms);
              // Unconditional — no upper clamp. A previous version capped
              // this against the site's fixed footer on short viewports,
              // but the cap had no floor, so when both constraints
              // couldn't be satisfied at once it silently won by pulling
              // the CTA back UP into the cards (confirmed: -75px to -115px
              // of actual overlap at 1440x700 and 1440x620). The CTA now
              // lives outside .cardsAndHeader's clip-path (see that class's
              // comment), so it's free to render below the initial 100vh
              // fold on a short viewport without being clipped — a small
              // natural scroll to reach it there is fine; overlapping the
              // cards never is.
              ctaRef.current.style.top = `${maxCardBottom - layerTop + CTA_GAP_PX}px`;
            }

            const ctaProgress = gsap.utils.clamp(0, 1, (progress - 0.85) / 0.15);
            const eased = smoothStep(ctaProgress);
            gsap.set(ctaRef.current, {
              opacity: eased,
              scale: gsap.utils.interpolate(0.92, 1, eased),
            });
          }
      }

      const driver = ScrollTrigger.create({
        trigger: servicesEl,
        start: "top bottom",
        end: endValue,
        scrub: 1,
        onUpdate: (self) => applyDriverProgress(self.progress),
      });
      driverTriggerRef.current = driver;
      applyDriverProgressRef.current = applyDriverProgress;

      return () => {
        pinAndToggle.kill();
        visibility.kill();
        driver.kill();
        pinTriggerRef.current = null;
        driverTriggerRef.current = null;
        applyDriverProgressRef.current = null;
      };
    },
    { scope: servicesRef, dependencies: [mode] }
  );

  // The layer (and the header/cards inside it) mount via the portal below
  // exactly when `inView` flips true, so refs are only guaranteed to exist
  // here. Two things need doing at that exact moment:
  // 1. Give the layer its correct starting position/mode immediately.
  // 2. Re-apply the card/header transforms for the *current* scroll
  //    progress directly. `driver` is a scrub tween — if scrolling had
  //    already settled by the time these refs landed (a real race: the
  //    portal's mount can lag a render tick behind the scroll event that
  //    triggered it, and GSAP's scrub tween stops ticking once it reaches
  //    its target), it may never call onUpdate again on its own, leaving
  //    the freshly-mounted cards frozen at their default CSS state until
  //    the next scroll. Calling the same update function directly, with
  //    the trigger's own current progress, fixes that regardless of
  //    whether the tween decides to tick again.
  // Plain useEffect runs after the browser paints, which leaves a window —
  // small, but real — where the freshly-mounted layer could paint once
  // with no clip-path and default (unrendered) card transforms before this
  // corrects it. useLayoutEffect runs synchronously after the DOM mutation
  // but before paint, closing that window entirely.
  useLayoutEffect(() => {
    if (!inView) return;
    const layer = cardsLayerRef.current;
    const servicesEl = servicesRef.current;
    if (!layer || !servicesEl) return;
    if (pinTriggerRef.current?.isActive) {
      applyFixed(layer);
    } else {
      applyAbsolute(layer, servicesEl);
    }
    if (driverTriggerRef.current && applyDriverProgressRef.current) {
      applyDriverProgressRef.current(driverTriggerRef.current.progress);
    }
  }, [inView]);

  return (
    <>
      <section
        ref={servicesRef}
        className={clsx(styles.services, "-mx-6 sm:-mx-10 lg:-mx-16 xl:-mx-24")}
      >
        {mode === "static" && (
          <div
            ref={headerRef}
            className={styles.servicesHeader}
            style={{ transform: "translateY(0%)" }}
          >
            <h2 className="font-display text-[clamp(1.75rem,5vw,3.25rem)] font-medium text-ink">
              {SERVICES_HEADER_TEXT}
            </h2>
          </div>
        )}

        {mode === "static" && (
          <div className={styles.cardsContainerStatic}>
            {CARD_REVEAL_CATEGORIES.map((category, index) => (
              <FlipCard
                key={category.id}
                category={category}
                index={index}
                variant="static"
              />
            ))}
          </div>
        )}

        {mode === "static" && (
          <div className={styles.ctaStatic}>
            <CtaButton />
          </div>
        )}
      </section>

      {mode === "animated" &&
        inView &&
        typeof document !== "undefined" &&
        createPortal(
          <div ref={cardsLayerRef} className={styles.cardsLayer}>
            {/* Header + cards share this wrapper because both need the
                about-section clip-path (the header slides in during the
                same pre-roll window the cards fade in during). The CTA is
                a sibling of this wrapper, not a child of it — see
                .ctaPortal's own comment for why that separation matters. */}
            <div ref={cardsAndHeaderRef} className={styles.cardsAndHeader}>
              {/* Rendered here (inside the same portal as the cards) rather
                  than in-flow inside <section> above — see the comment on
                  .servicesHeaderPortal for why an in-flow header can never
                  out-rank this portal via z-index alone. */}
              <div ref={headerRef} className={styles.servicesHeaderPortal}>
                <h2 className="font-display text-[clamp(1.75rem,5vw,3.25rem)] font-medium text-ink">
                  {SERVICES_HEADER_TEXT}
                </h2>
              </div>
              <div className={styles.cardsContainer}>
                {CARD_REVEAL_CATEGORIES.map((category, index) => (
                  <FlipCard
                    key={category.id}
                    category={category}
                    index={index}
                    variant="animated"
                    outerRef={(el) => {
                      cardOuterRefs.current[index] = el;
                    }}
                    innerRef={(el) => {
                      innerCardRefs.current[index] = el;
                    }}
                  />
                ))}
              </div>
            </div>
            <div ref={ctaRef} className={styles.ctaPortal}>
              <CtaButton />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
