import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

// Every plugin the app actually uses (ScrollTrigger: scroll-path.tsx,
// hero-scatter.tsx, pinned-reveal.tsx, scroll-trigger-refresh.tsx;
// SplitText: text-reveal.tsx; CustomEase: see motionEaseOut below),
// registered exactly once here instead of separately in each consumer.
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

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

export { gsap, ScrollTrigger, SplitText };
