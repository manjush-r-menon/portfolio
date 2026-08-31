import { blogs } from "@/data/blog-data/blog-data";

// The 7 real cards are the same 7 posts /blogs itself renders — a single
// source of truth, so this marquee can't drift out of sync with the actual
// post list/links. Bonus/outro cards are a separate shape (no title,
// excerpt, or link — just an aside) since they're not real posts and never
// go through CardFace's "post" rendering path (title + excerpt + Read more
// button) — see blog-marquee.tsx's CardFace.
export type BlogMarqueeCard =
  | {
      id: string;
      kind: "post";
      title: string;
      excerpt: string;
      link: string;
    }
  | {
      id: string;
      kind: "bonus";
      text: string;
    };

export const BLOG_MARQUEE_CARDS: BlogMarqueeCard[] = blogs.map(
  (post, index) => ({
    id: `card-${String(index + 1).padStart(2, "0")}`,
    kind: "post",
    title: post.title,
    excerpt: post.description,
    link: post.link,
  })
);

/**
 * Trailing bonus/outro cards — rendered after the real cards in the same
 * scrollable sequence, but deliberately not part of BLOG_MARQUEE_CARDS:
 * the pin-release condition is sized off the real list's length alone, so
 * these never count toward "reaching the end" and can never become the
 * pin's release trigger. See blog-marquee.tsx for why they also can never
 * become the *focused* card either (not just "not the release trigger").
 */
export const BLOG_MARQUEE_BONUS_CARDS: BlogMarqueeCard[] = [
  {
    id: "bonus-01",
    kind: "bonus",
    text: "There's no card 8. I checked twice.",
  },
  {
    id: "bonus-02",
    kind: "bonus",
    text: "This one's just here so card 8 doesn't feel lonely.",
  },
];
