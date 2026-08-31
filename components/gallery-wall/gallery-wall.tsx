import clsx from "clsx";
import galleryCenterPoster from "@/images/gallery-center-poster.svg";
import styles from "./gallery-wall.module.css";

type Frame = {
  pos: keyof typeof styles;
  finish: "frameWhite" | "frameBlackHero" | "frameOval";
  mat: keyof typeof styles;
  src: string;
  alt: string;
};

// Dummy placeholder photos — swap `src` for real ones later, everything
// else (frame style, position, size) can stay as-is.
const FRAMES: Frame[] = [
  {
    // 1. Top-Left Primary — architectural/abstract wall
    pos: "f1",
    finish: "frameWhite",
    mat: "matWide",
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500",
    alt: "Architectural abstract wall",
  },
  {
    // 2. Top-Center Left — desert group portrait
    pos: "f2",
    finish: "frameWhite",
    mat: "matStandard",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
    alt: "Desert group portrait",
  },
  {
    // 3. Top-Center Right — stylized solo portrait
    pos: "f3",
    finish: "frameWhite",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    alt: "Stylized solo portrait",
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
    // 5. Top-Right Column — colorful abstract painting
    pos: "f5",
    finish: "frameWhite",
    mat: "matDeep",
    src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400",
    alt: "Colorful abstract painting",
  },
  {
    // 6. Far-Right Edge — street photography
    pos: "f6",
    finish: "frameWhite",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300",
    alt: "Street photography",
  },
  {
    // 7. Mid-Far-Left — indoor scene
    pos: "f7",
    finish: "frameWhite",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300",
    alt: "Indoor scene",
  },
  {
    // 8. Lower-Left Mini Oval — intimate pair portrait
    pos: "f8",
    finish: "frameOval",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    alt: "Intimate pair portrait",
  },
  {
    // 9. Lower-Left Primary — figures on outdoor field
    pos: "f9",
    finish: "frameWhite",
    mat: "matMedium",
    src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400",
    alt: "Figures on an outdoor field",
  },
  {
    // 10. Bottom-Center Left — coastal landscape
    pos: "f10",
    finish: "frameWhite",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    alt: "Coastal landscape",
  },
  {
    // 11. Bottom-Center Right — monochrome portrait
    pos: "f11",
    finish: "frameWhite",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300",
    alt: "Monochrome figure portrait",
  },
  {
    // 12. Lower-Right Oval — festive outdoor portrait
    pos: "f12",
    finish: "frameOval",
    mat: "matSlim",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300",
    alt: "Festive outdoor portrait",
  },
  {
    // 13. Lower-Right Column — studio portrait sitting
    pos: "f13",
    finish: "frameWhite",
    mat: "matDeep",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    alt: "Studio portrait, sitting",
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
