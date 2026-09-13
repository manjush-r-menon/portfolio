import {
  BLOG_MARQUEE_CARDS,
  BLOG_MARQUEE_BONUS_CARDS,
} from "@/data/blog-marquee-data";
import { CardFace, CARD_TONES } from "./card-face";

// Same rendered sequence as the desktop marquee's StaticGrid fallback —
// real cards first, then the bonus/outro pair. See BlogMarquee's own
// ALL_CARDS comment for why the two lists stay separate exports instead of
// being pre-merged in the data file.
const ALL_CARDS = [...BLOG_MARQUEE_CARDS, ...BLOG_MARQUEE_BONUS_CARDS];

/**
 * Mobile replacement for the desktop marquee (see BlogMarquee): a plain,
 * native `overflow-x-auto` scroll-snap strip, not smooothy's `Core`
 * instance. The desktop marquee's peel/rotate/scale choreography and its
 * whole `pinScrollVh` scrub mechanism are entangled with PinnedTrack's pin
 * (see AnimatedMarquee's own doc comment) — mobile never mounts that pin
 * (see HorizontalScrollHome), so there's no scroll-position feed left to
 * drive any of it even if it were reused. Touch input drives this strip
 * directly via the browser's own scroll-snap physics instead: no rAF loop,
 * no manual drag handling, no choreography to keep in sync with anything.
 *
 * Deliberately imports `CardFace`/`CARD_TONES` from `./card-face`, not
 * from `./blog-marquee` — that file's top-level `import Core from
 * "smooothy"` would otherwise ride along into this file's own module graph
 * (and therefore into the mobile bundle) purely from importing an
 * unrelated named export out of the same file, even though Core itself is
 * never referenced here. Keeping the shared card markup in its own
 * smooothy-free file is what actually guarantees Core stays entirely
 * absent from the mobile code path, not just unused-but-still-shipped.
 *
 * Includes the bonus/joke cards 08-09 at the end, same as StaticGrid —
 * there's no release-gating mechanic to protect on this path either
 * (that only ever existed to keep PinnedTrack's hold in sync with the
 * marquee's own peel, and neither exists here).
 */
export function BlogMarqueeMobileStrip() {
  return (
    <div
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
    >
      {ALL_CARDS.map((card, index) => (
        <div
          key={card.id}
          role="listitem"
          className="flex min-h-[300px] w-[78vw] max-w-[340px] shrink-0 snap-center flex-col rounded-2xl p-6"
          style={{
            backgroundColor: CARD_TONES[index % CARD_TONES.length],
            border: "1px solid var(--line-strong)",
          }}
        >
          <CardFace card={card} number={String(index + 1).padStart(2, "0")} />
        </div>
      ))}
    </div>
  );
}
