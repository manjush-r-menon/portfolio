"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { CARD_REVEAL_CATEGORIES } from "@/data/card-reveal-data";
import { useIsMobileScroll } from "@/utils/use-is-mobile-scroll";
import styles from "./card-reveal.module.css";

gsap.registerPlugin(ScrollTrigger);

const smoothStep = (p: number) => p * p * (3 - 2 * p);

const HERO_CARD_CLASSES = [styles.heroCard1, styles.heroCard2, styles.heroCard3];

export function HeroScatter({ reduced }: { reduced: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const heroCardsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isMobileScroll = useIsMobileScroll();

  useGSAP(
    () => {
      if (!heroRef.current || isMobileScroll) return;

      // See the equivalent comment in pinned-reveal.tsx: `reduced` lags one
      // tick behind the real OS setting on first mount, so check matchMedia
      // directly to avoid a frame of scatter for reduced-motion users.
      const prefersReduced =
        reduced ||
        (typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches);

      if (prefersReduced) {
        // Fully-landed / at-rest state: no scatter at all.
        gsap.set(heroCardsRef.current, { opacity: 1 });
        gsap.set(cardRefs.current, { x: "0%", y: "0%", rotation: 0, scale: 1 });
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "75% top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          gsap.set(heroCardsRef.current, {
            opacity: gsap.utils.interpolate(1, 0.5, smoothStep(progress)),
          });

          cardRefs.current.forEach((card, index) => {
            if (!card) return;
            const delay = index * 0.9;
            const cardProgress = gsap.utils.clamp(
              0,
              1,
              (progress - delay * 0.1) / (1 - delay * 0.1)
            );

            const y = gsap.utils.interpolate("0%", "350%", smoothStep(cardProgress));
            const scale = gsap.utils.interpolate(1, 0.75, smoothStep(cardProgress));

            let x = "0%";
            let rotation = 0;

            if (index === 0) {
              x = gsap.utils.interpolate("0%", "90%", smoothStep(cardProgress));
              rotation = gsap.utils.interpolate(0, -15, smoothStep(cardProgress));
            } else if (index === 2) {
              x = gsap.utils.interpolate("0%", "-90%", smoothStep(cardProgress));
              rotation = gsap.utils.interpolate(0, 15, smoothStep(cardProgress));
            }

            gsap.set(card, { y, x, rotation, scale });
          });
        },
      });

      return () => trigger.kill();
    },
    {
      scope: heroRef,
      dependencies: [reduced, isMobileScroll],
      // Without this, GSAP-related objects (the ScrollTrigger created below)
      // only revert on unmount, not on each dependency change — `reduced`
      // and `isMobileScroll` can both flip mid-session (OS setting toggle,
      // resize/orientation change), and the stale trigger would otherwise
      // keep driving gsap.set() on these cards after the mobile/reduced
      // branch has already decided to skip creating a new one.
      revertOnUpdate: true,
    }
  );

  // On mobile, the ScrollTrigger scatter above never runs (the useGSAP
  // callback bails on `isMobileScroll` before it builds one — see above),
  // so this section would otherwise sit there as a full 100svh screen of
  // static, non-animated cards carrying no real information (just each
  // category's title/index — the actual description lives on PinnedReveal's
  // flip-card backs, further down). Skipping the section outright on mobile
  // moves straight from the case studies into AboutDivider's "Keep
  // scrolling — it gets good" instead of padding the scroll with a dead,
  // duplicate screen first.
  if (isMobileScroll) {
    return null;
  }

  return (
    <section
      ref={heroRef}
      className={clsx(styles.hero, "-mx-6 sm:-mx-10 lg:-mx-16 xl:-mx-24")}
    >
      <div ref={heroCardsRef} className={styles.heroCards}>
        {CARD_REVEAL_CATEGORIES.map((category, index) => (
          <div
            key={category.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={clsx(styles.heroCard, HERO_CARD_CLASSES[index])}
          >
            <div className={styles.cardTitleRow}>
              <span>{category.title}</span>
              <span>{category.index}</span>
            </div>
            <div className={styles.cardTitleRow}>
              <span>{category.index}</span>
              <span>{category.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
