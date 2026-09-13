import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Split out of gsap-init.ts so only components that actually build a
// ScrollTrigger instance (scroll-path.tsx, hero-scatter.tsx,
// pinned-reveal.tsx) — plus the root-mounted ScrollTriggerRefresh, which
// needs it site-wide to recompute stale trigger points after late image
// loads — pull this plugin's weight into their route's bundle.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
