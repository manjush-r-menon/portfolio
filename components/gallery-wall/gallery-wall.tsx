import clsx from "clsx";
import Image from "next/image";
import { TaglineGalleryEntry } from "./tagline-gallery-entry";
import { getSiteImage } from "@/utils/site-images";
import styles from "./gallery-wall.module.css";

type Frame = {
  pos: keyof typeof styles;
  finish: "frameWhite" | "frameBlackHero" | "frameOval";
  mat: keyof typeof styles;
  /** Blob URL, migrated from a local static import — see utils/site-images.ts. */
  src: string;
  alt: string;
  /** Matches this frame's own width % (gallery-wall.module.css) against the
   * two container caps (1150px above 1440px viewports, 720px between
   * 641-1440px) plus the mobile flex box (45vw capped at 200px), so
   * next/image requests the right generated size instead of guessing. */
  sizes: string;
  /** True for frames that land in the first flex-wrap row on mobile
   * (see gallery-wall.module.css's @media(max-width:640px) block, which
   * has no `order` override, so DOM order === visual order there) — those
   * skip native lazy-loading since they're the ones a mobile scroll into
   * this section reveals first. Everything else stays lazy: all 12 photos
   * now weigh ~20-80KB combined into ~0.3MB total, so lazy-loading them is
   * cheap insurance, not a meaningful loading-order problem the way it was
   * before re-encoding. Not `priority` — this section is below the fold
   * and only reached by scrolling, so forcing a `<link rel="preload">` for
   * it on every page load would cost more than it'd save.
   */
  eager?: boolean;
};

const MOBILE_SIZE = "(max-width: 640px) min(45vw, 200px)";

const FRAMES: Frame[] = [
  {
    // 1. Top-Left Primary — misty hillside
    pos: "f1",
    finish: "frameWhite",
    mat: "matWide",
    src: getSiteImage("gallery-image-1").url,
    alt: "Misty hillside with trees emerging from fog",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 180px, 288px`,
    eager: true,
  },
  {
    // 2. Top-Center Left — hilltop selfie
    pos: "f2",
    finish: "frameWhite",
    mat: "matStandard",
    src: getSiteImage("gallery-image-2").url,
    alt: "Sitting on a hilltop with a selfie stick under an overcast sky",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 108px, 173px`,
    eager: true,
  },
  {
    // 3. Top-Center Right — lakeside view
    pos: "f3",
    finish: "frameWhite",
    mat: "matSlim",
    src: getSiteImage("gallery-image-3").url,
    alt: "Two people looking out over a lake from a grassy bank",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 76px, 121px`,
  },
  {
    // 5. Top-Right Column — fisheye street action
    pos: "f5",
    finish: "frameWhite",
    mat: "matDeep",
    src: getSiteImage("gallery-image-4").url,
    alt: "Fisheye shot of a jump between a bus and a car on a road",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 137px, 219px`,
  },
  {
    // 6. Far-Right Edge — motorcycle on a forest road
    pos: "f6",
    finish: "frameWhite",
    mat: "matSlim",
    src: getSiteImage("gallery-image-5").url,
    alt: "Motorcycle rounding a curve on a tree-lined road",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 104px, 167px`,
  },
  {
    // 7. Mid-Far-Left — silhouette at sunset
    pos: "f7",
    finish: "frameWhite",
    mat: "matSlim",
    src: getSiteImage("gallery-image-6").url,
    alt: "Silhouette against sunlight filtering through trees",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 104px, 167px`,
  },
  {
    // 8. Lower-Left Mini Oval — yak and mountain lake
    pos: "f8",
    finish: "frameOval",
    mat: "matSlim",
    src: getSiteImage("gallery-image-7").url,
    alt: "Standing beside a decorated yak by a snowy mountain lake",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 58px, 92px`,
  },
  {
    // 9. Lower-Left Primary — Kathakali performer, close up
    pos: "f9",
    finish: "frameWhite",
    mat: "matMedium",
    src: getSiteImage("gallery-image-8").url,
    alt: "Kathakali performer's face paint and headdress, close up",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 133px, 213px`,
  },
  {
    // 10. Bottom-Center Left — Kathakali face paint detail
    pos: "f10",
    finish: "frameWhite",
    mat: "matSlim",
    src: getSiteImage("gallery-image-9").url,
    alt: "Close-up of gold and green Kathakali face paint",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 108px, 173px`,
  },
  {
    // 11. Bottom-Center Right — balloon seller
    pos: "f11",
    finish: "frameWhite",
    mat: "matSlim",
    src: getSiteImage("gallery-image-10").url,
    alt: "Boy holding smiley-face balloons at a night market",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 76px, 121px`,
  },
  {
    // 12. Lower-Right Oval — temple elephant
    pos: "f12",
    finish: "frameOval",
    mat: "matSlim",
    src: getSiteImage("gallery-image-11").url,
    alt: "Decorated temple elephant led through a doorway",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 76px, 121px`,
  },
  {
    // 13. Lower-Right Column — Kathakali playing-card design
    pos: "f13",
    finish: "frameWhite",
    mat: "matDeep",
    src: getSiteImage("gallery-image-12").url,
    alt: "Playing-card style graphic of a Kathakali performer, King of Kathakali",
    sizes: `${MOBILE_SIZE}, (max-width: 1440px) 108px, 173px`,
  },
];

export function GalleryWall() {
  return (
    <div className={styles.container}>
      {/* Centerpiece poster is the hover entry point into the gallery —
          see tagline-gallery-entry.tsx for the break-apart/reform
          animation and why it fetches+inlines the SVG instead of using a
          plain <img> like the frames' next/image below. */}
      <TaglineGalleryEntry className={clsx(styles.centerPoster, styles.f4)} />

      {FRAMES.map((item) => (
        <div
          key={item.pos}
          className={clsx(styles.frame, styles[item.finish], styles[item.pos])}
        >
          <div className={clsx(styles.mat, styles[item.mat])}>
            <div
              className={clsx(
                styles.artContainer,
                item.finish === "frameOval" && styles.oval
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={item.sizes}
                loading={item.eager ? "eager" : "lazy"}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
