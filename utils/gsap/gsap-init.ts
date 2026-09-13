import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// CustomEase only. ScrollTrigger and SplitText each live in their own
// sibling module (gsap-scroll-trigger.ts / gsap-split-text.ts) instead of
// being registered here too — this file is imported from the root layout's
// render tree (via PageSettle), so anything registered here ships on every
// route regardless of whether that route uses it. ScrollTrigger and
// SplitText are each meaningfully sized plugins that most routes have no
// use for; keeping them in their own modules means only the routes that
// actually import a component needing that plugin pay for it. See those
// two files' own comments for what imports each.
gsap.registerPlugin(CustomEase);

// Framer Motion's built-in "easeOut" (motion-utils/dist/cjs/index.js:
// `cubicBezier(0, 0, 0.58, 1)` — the same control points as CSS's own
// `ease-out`), reproduced exactly for page-settle.tsx and
// case-study-card.tsx, the two components migrated off framer-motion
// during the animation-library-consolidation pass. CustomEase.create
// parses a plain "x1,y1,x2,y2" string as those literal cubic-bezier
// control points (see setData in node_modules/gsap/CustomEase.js: a
// 4-value match gets 0,0 unshifted and 1,1 pushed to form the full
// curve) — a byte-for-byte match, not an approximation. None of GSAP's
// own named eases (power1/2/3/4, sine, circ, etc.) use this curve or
// are numerically equivalent to it.
export const motionEaseOut = CustomEase.create("motionEaseOut", "0, 0, 0.58, 1");

// Framer Motion's built-in "easeInOut" (motion-utils/dist/cjs/index.js:
// `cubicBezier(0.42, 0, 0.58, 1)`, the same control points as CSS's own
// `ease-in-out`), reproduced exactly for ambient-shape.tsx and
// idle-icon-pair.tsx, migrated off framer-motion in the same pass that
// scoped the rest of the animation-library consolidation down to just
// these two self-contained loops. Same byte-for-byte CustomEase.create
// parsing as motionEaseOut above.
export const motionEaseInOut = CustomEase.create(
  "motionEaseInOut",
  "0.42, 0, 0.58, 1",
);

export { gsap };
