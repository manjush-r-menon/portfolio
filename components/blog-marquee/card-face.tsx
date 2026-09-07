import clsx from "clsx";
import { ArrowIcon } from "@/components/icon-components/arrow-icon";
import type { BlogMarqueeCard } from "@/data/blog-marquee-data";

// Restrained, on-brand tints — same --card-1/2/3 deck-color tokens the
// certifications page uses (12/38/65% mixes of --accent over --bg), cycled
// across the placeholder cards instead of the reference's rainbow palette.
// Shared by every card-grid rendering (desktop marquee, its static/reduced-
// motion fallback, and the mobile swipe strip) — kept in this
// smooothy-free file specifically so none of them have to import
// blog-marquee.tsx (and, transitively, smooothy) just to render a card.
export const CARD_TONES = ["var(--card-1)", "var(--card-2)", "var(--card-3)"];

/**
 * Every card (real or bonus) gets a small corner index number — same role
 * and typography as the card-reveal deck's `.cardTitleRow` numbers (see
 * card-reveal.module.css: font-sans, text-xs, font-semibold, tracking-wide,
 * plain `text-ink`, checked there against the deepest 65% tone at 7.38:1
 * contrast, comfortably past AA). Placed diagonally — top-left, then
 * bottom-right — rather than paired with an issuer name in a mirrored top
 * row + bottom row like that deck does, since these cards have no
 * issuer-equivalent second field to pair a number with; a single number
 * per corner is the adapted version of the same motif. Bonus cards 8-9
 * get it too (numbers "08"/"09" in sequence) — purely presentational, it
 * doesn't depend on there being real content underneath.
 *
 * Bonus cards just render their one aside line — no title, no excerpt, no
 * link, so there's nothing to clamp or link out to.
 *
 * Real post cards show the actual title + excerpt from BLOG_MARQUEE_CARDS
 * (sourced from the same `blogs` data /blogs itself renders), `line-clamp`-ed
 * so a longer real excerpt can never overflow the card's fixed box — the
 * card's own height doesn't grow to fit content, so without a clamp a long
 * excerpt would spill past the card's bottom edge instead of stopping
 * cleanly at a word boundary. The "Read more" link mirrors the accent-pill
 * CTA already used elsewhere (see pinned-reveal.tsx's `CtaButton`, "View
 * certifications") rather than inventing a new button style — but as a
 * plain external `<a>`, not `TransitionLink`: these are real external post
 * URLs, and TransitionLink's whole mechanism (`router.push` + the page
 * curtain) only makes sense for in-app routes.
 *
 * The card itself is plain `flex flex-col` (no `justify-between`) — the
 * bottom row (button/number) is pinned to the card's bottom edge via its
 * own `mt-auto` instead, since `justify-between` only cleanly distributes
 * exactly two children, and there are now up to four (top number, content,
 * bottom row) once the corner numbers were added.
 */
export function CardFace({
  card,
  number,
}: {
  card: BlogMarqueeCard;
  number: string;
}) {
  const numberClass =
    "font-sans text-xs font-semibold tracking-[0.06em] text-ink";

  if (card.kind === "bonus") {
    return (
      <>
        <span className={numberClass}>{number}</span>
        <p className="mt-3 font-sans text-[15px] leading-snug font-medium text-ink">
          {card.text}
        </p>
        <span className={clsx(numberClass, "mt-auto self-end")}>
          {number}
        </span>
      </>
    );
  }

  return (
    <>
      <span className={numberClass}>{number}</span>
      <div className="mt-3">
        <h3 className="line-clamp-4 font-sans text-lg leading-snug font-semibold text-ink">
          {card.title}
        </h3>
        {/* --ink-dim (the site's usual muted-text color) is tuned for
            plain --bg and fails WCAG AA once it sits on a card tint —
            drops as low as 1.95:1 on --card-3 (65%), checked empirically.
            --accent-ink is the same fix already used for this exact
            problem on the certifications deck's meta line (see
            .certMeta in card-reveal.module.css): holds 4.83–9.91:1 across
            all three --card-N tones. */}
        <p className="mt-3 line-clamp-5 font-sans text-[15px] leading-relaxed text-accent-ink">
          {card.excerpt}
        </p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3">
        <a
          href={card.link}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2 font-sans text-xs font-medium text-bg transition-colors hover:bg-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
        >
          Read more
          <ArrowIcon className="h-3.5 w-3.5 shrink-0" />
        </a>
        <span className={numberClass}>{number}</span>
      </div>
    </>
  );
}
