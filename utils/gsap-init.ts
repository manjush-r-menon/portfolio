import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Every plugin the app actually uses (ScrollTrigger: scroll-path.tsx,
// hero-scatter.tsx, pinned-reveal.tsx, scroll-trigger-refresh.tsx;
// SplitText: text-reveal.tsx), registered exactly once here instead of
// separately in each consumer.
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
