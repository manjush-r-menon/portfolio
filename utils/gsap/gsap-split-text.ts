import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

// Split out of gsap-init.ts: SplitText is only ever used by
// text-reveal.tsx, which itself is only rendered on the Home page. Keeping
// it in its own module (rather than the shared gsap-init.ts, which the
// root-mounted PageSettle also imports) means every other route's bundle
// no longer pays for this plugin's parse cost.
gsap.registerPlugin(SplitText);

export { gsap, SplitText };
