import clsx from "clsx";
import galleryCenterPoster from "@/images/gallery-center-poster.svg";
import galleryImage1 from "@/images/gallery-image-1.jpg";
import galleryImage2 from "@/images/gallery-image-2.jpg";
import galleryImage3 from "@/images/gallery-image-3.jpg";
import galleryImage4 from "@/images/gallery-image-4.jpg";
import galleryImage5 from "@/images/gallery-image-5.jpg";
import galleryImage6 from "@/images/gallery-image-6.jpg";
import galleryImage7 from "@/images/gallery-image-7.jpg";
import galleryImage8 from "@/images/gallery-image-8.png";
import galleryImage9 from "@/images/gallery-image-9.png";
import galleryImage10 from "@/images/gallery-image-10.png";
import galleryImage11 from "@/images/gallery-image-11.png";
import galleryImage12 from "@/images/gallery-image-12.png";
import styles from "./gallery-wall.module.css";

type Frame = {
  pos: keyof typeof styles;
  finish: "frameWhite" | "frameBlackHero" | "frameOval";
  mat: keyof typeof styles;
  src: string;
  alt: string;
};

// Real photos, swapped in for the original dummy Unsplash placeholders.
// gallery-image-7 was originally a joke meme-sticker edit not meant for the
// portfolio and got swapped out for a real replacement — all 12 slots
// (barring f4's own dedicated centerpiece poster) are real photos now.
const FRAMES: Frame[] = [
  {
    // 1. Top-Left Primary — misty hillside
    pos: "f1",
    finish: "frameWhite",
    mat: "matWide",
    src: galleryImage1.src,
    alt: "Misty hillside with trees emerging from fog",
  },
  {
    // 2. Top-Center Left — hilltop selfie
    pos: "f2",
    finish: "frameWhite",
    mat: "matStandard",
    src: galleryImage2.src,
    alt: "Sitting on a hilltop with a selfie stick under an overcast sky",
  },
  {
    // 3. Top-Center Right — lakeside view
    pos: "f3",
    finish: "frameWhite",
    mat: "matSlim",
    src: galleryImage3.src,
    alt: "Two people looking out over a lake from a grassy bank",
  },
  {
    // 4. Hero Center Anchor — the focal point
    pos: "f4",
    finish: "frameWhite",
    mat: "matNone",
    src: galleryCenterPoster.src,
    alt: "Live life with passion and purpose — typographic poster, centerpiece",
  },
  {
    // 5. Top-Right Column — fisheye street action
    pos: "f5",
    finish: "frameWhite",
    mat: "matDeep",
    src: galleryImage4.src,
    alt: "Fisheye shot of a jump between a bus and a car on a road",
  },
  {
    // 6. Far-Right Edge — motorcycle on a forest road
    pos: "f6",
    finish: "frameWhite",
    mat: "matSlim",
    src: galleryImage5.src,
    alt: "Motorcycle rounding a curve on a tree-lined road",
  },
  {
    // 7. Mid-Far-Left — silhouette at sunset
    pos: "f7",
    finish: "frameWhite",
    mat: "matSlim",
    src: galleryImage6.src,
    alt: "Silhouette against sunlight filtering through trees",
  },
  {
    // 8. Lower-Left Mini Oval — yak and mountain lake
    pos: "f8",
    finish: "frameOval",
    mat: "matSlim",
    src: galleryImage7.src,
    alt: "Standing beside a decorated yak by a snowy mountain lake",
  },
  {
    // 9. Lower-Left Primary — Kathakali performer, close up
    pos: "f9",
    finish: "frameWhite",
    mat: "matMedium",
    src: galleryImage8.src,
    alt: "Kathakali performer's face paint and headdress, close up",
  },
  {
    // 10. Bottom-Center Left — Kathakali face paint detail
    pos: "f10",
    finish: "frameWhite",
    mat: "matSlim",
    src: galleryImage9.src,
    alt: "Close-up of gold and green Kathakali face paint",
  },
  {
    // 11. Bottom-Center Right — balloon seller
    pos: "f11",
    finish: "frameWhite",
    mat: "matSlim",
    src: galleryImage10.src,
    alt: "Boy holding smiley-face balloons at a night market",
  },
  {
    // 12. Lower-Right Oval — temple elephant
    pos: "f12",
    finish: "frameOval",
    mat: "matSlim",
    src: galleryImage11.src,
    alt: "Decorated temple elephant led through a doorway",
  },
  {
    // 13. Lower-Right Column — Kathakali playing-card design
    pos: "f13",
    finish: "frameWhite",
    mat: "matDeep",
    src: galleryImage12.src,
    alt: "Playing-card style graphic of a Kathakali performer, King of Kathakali",
  },
];

export function GalleryWall() {
  return (
    <div className={styles.container}>
      {FRAMES.map((item) => {
        if (item.pos === "f4") {
          return (
            <img
              key={item.pos}
              className={clsx(styles.centerPoster, styles[item.pos])}
              src={item.src}
              alt={item.alt}
            />
          );
        }

        return (
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
                {/* Dummy placeholder images — plain <img>, not next/image,
                    since this is temporary stock-photo content on an
                    unconfigured remote domain. */}
                <img src={item.src} alt={item.alt} loading="lazy" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
