# Mobile scroll-animation plan

**Planning only — no code was changed to produce this.** Every claim below is grounded in what's actually in the repo today (file/line references included), not a general "mobile scroll is hard" essay. Where I couldn't verify something without a real render (visual drift, exact text overflow), I've said so explicitly rather than asserting it as fact.

---

## 1. Inventory — every scroll/animation-driven section

| # | Section | Owning component(s) | Desktop mechanism | Existing mobile/breakpoint handling |
|---|---|---|---|---|
| 1 | Home page — all 5 panels | `HorizontalScrollHome` → `PinnedTrack` (`app/page.tsx`, `components/horizontal-scroll/*`) | `position: sticky` track, `count×100vh` (+ extra for the marquee hold) tall wrapper; horizontal `translateX` driven 1:1 by vertical scroll progress via Framer Motion's `useScroll` reading real `window.scrollY`, which Lenis drives | **None.** Only gate is `prefers-reduced-motion` (mount-gated `matchMedia` check in `horizontal-scroll-home.tsx:38-43`). No width check anywhere in this chain. |
| 2 | Home panel 4 — blog marquee | `BlogMarquee` (`components/blog-marquee/blog-marquee.tsx`), nested inside #1's pin via `pinIndex`/`pinScrollVh`/`releaseGateRatio` | smooothy `Core` instance, position driven entirely by `pinScrollVh` (a MotionValue written by `PinnedTrack`); Core's own drag/touch input is explicitly disabled (`slider.paused = true`, line 428) | Same reduced-motion-only gate (`blog-marquee.tsx:517-522`). No width check. No touch/swipe input of any kind — scroll is the *only* input path, and that path only exists inside #1's pin. |
| 3 | Work page hero — 3 scatter cards | `HeroScatter` (`components/card-reveal/hero-scatter.tsx`) | GSAP `ScrollTrigger` with `scrub: 1` (no `pin`) — cards fan out (x/y/rotate/scale) and dim as the hero scrolls past | **Yes, already exists**: `window.innerWidth <= 1000` early-return (line 24) skips the whole effect; a matching CSS breakpoint (`card-reveal.module.css:36-40`, `max-width: 1000px`) switches `.heroCards` to full width. Checked once at mount only — no resize/orientation listener. |
| 4 | Work page — certifications-style flip deck | `PinnedReveal` (`components/card-reveal/pinned-reveal.tsx`) | GSAP `ScrollTrigger` with real `pin: true`, plus a `createPortal`-mounted fixed-position layer, flipping/scattering 3 cards through a scrub-driven sequence | **Yes, already exists, and it's the best one in the codebase**: `window.innerWidth <= 1000` (line 227) forces `mode: "static"` — a complete, separately-built fallback: plain grid, cards already showing their flipped "back" face (all content readable), no pin, no portal, no fixed positioning, zero GSAP. Also mount-only, no resize listener. |
| 5 | About page — SVG path draw | `ScrollPath` (`components/scroll-path/scroll-path.tsx`) | GSAP `ScrollTrigger` `scrub: true`, **no `pin`** — a hand-plotted SVG `strokeDashoffset` scrubs against a naturally-tall, normally-scrolling 4-row block | Partial: the *rows* already reflow at `lg:` (1024px, Tailwind's own breakpoint) from `lg:flex-row` to stacked `flex-col`, and the path's own container already gets `w-[275%] lg:w-[90%]` / `top-[15svh] lg:top-[25svh]` — but the path's actual `d` coordinates (line 217) are hand-plotted against the reference's *desktop* row heights/gaps (own doc comment, lines 30-33, says as much) and are never swapped for the stacked mobile layout. |
| 6 | About page — photo wall | `GalleryWall` (`components/gallery-wall/gallery-wall.tsx`), wrapped in `whileInView` by `app/about/page.tsx:19-27` | Pure CSS: 13 absolutely-positioned frames on a `%`-based canvas (`gallery-wall.module.css`) | **Yes, already solved well**: `@media (max-width: 640px)` (`gallery-wall.module.css:275-296`) switches every frame to `position: static` in a `flex-wrap` 2-column grid — a genuinely different, mobile-appropriate layout, not just a resize. |
| 7 | Work + Certifications — case study cards | `CaseStudyCard` (`components/case-study-card/case-study-card.tsx`) | Framer Motion `whileInView`, `once: true` — standard fade+slide-up on scroll into view | No special handling needed — `whileInView` is IntersectionObserver-based and behaves identically for touch and mouse. |

**Not scroll-driven, but relevant and sitting inside section #1's highest-risk panel** (mentioned as footnotes under §2, not full rows): `DraggablePhoto` (drag-gesture, already has correct `touch-none` + Framer pointer-drag handling for touch) and `SecretReveal` (mouse-hover-only spotlight text reveal — `onMouseEnter`/`onMouseMove`/`onMouseLeave` never fire on touch, so its content is currently just permanently invisible on mobile, not broken/crashing).

**Global, underlies #1-#4**: `SmoothScrollProvider` (`components/smooth-scroll/smooth-scroll-provider.tsx`), wrapping the entire app via `app/providers.tsx`. Lenis is active on **every** breakpoint including touch — `touchMultiplier: 0.45` is explicitly configured, confirming it processes touch input, not just wheel. Only `prefers-reduced-motion` skips instantiating it (line 42).

---

## 2. What's actually breaking on mobile, and why (code-evidenced)

### Section 1 — Home page pin (highest risk)

- **Layout overflow / content clipping, provable from the grid classes alone.** `PinnedTrack` wraps every panel in `sticky top-0 h-screen overflow-hidden` (`pinned-track.tsx:247`). Panel 1 (`app/page.tsx:76-142`) is `grid-cols-1 md:grid-cols-2` — on mobile the two desktop columns (name+skill block, then a giant "Frontend Developer" heading + `DraggablePhoto` + a third text block) **stack into one column inside that same fixed-height, `overflow-hidden` box**. Desktop already budgets up to `sm:min-h-[72vh]` for this content *in two columns*; stacking the same content into one column on a 375-428px-wide, ~650-915px-tall real device screen is very likely to exceed 100vh and get silently clipped (not scrolled — `overflow-hidden` has no scrollbar). Panel 4 (blog marquee, `app/page.tsx:191-212`) has the identical structural risk: `grid-cols-1 md:grid-cols-[1fr_1.5fr]` stacks the intro text above the marquee box in the same `h-screen overflow-hidden` wrapper.
- **Scroll-hijack / iOS momentum conflict risk.** The entire mechanism depends on Lenis continuously re-driving real `window.scrollY` inside a very tall (5 panels × 100vh + the marquee's own reserved `pinVh`, likely 700-900vh+ combined) sticky region. Lenis intercepting touch input to produce a damped scroll feel is a well-documented source of stuck/jerky/double-scroll behavior on iOS Safari specifically, especially combined with `position: sticky` and fixed elements (the site nav and footer are both fixed) mid-momentum-deceleration. I can't reproduce Mobile Safari's exact momentum physics from static code reading, but the ingredients for this specific, known failure class are all present.
- **UX mismatch independent of bugs.** Even if nothing above were broken, this is 700-900vh of vertical touch-scroll producing mostly *horizontal* visual motion, on a screen too small for the "sideways journey" to read as an intentional spatial device rather than confusing tunnel-scrolling — a widely-recognized anti-pattern for touch, not specific to this implementation.

### Section 2 — Blog marquee

Entirely dependent on #1's pin for its only input path. If #1 stops pinning on mobile (see recommendation below), the marquee has nothing left to drive it — it would render statically forever, not "broken" exactly, but functionally inert. Independent of that: it has **zero** touch/swipe input wired up at all (`Core`'s drag handling is explicitly disabled), so it could never be used stand-alone on a touch device even outside the pin.

### Sections 3 & 4 — Work page (HeroScatter, PinnedReveal)

Not currently broken in the "crashes/overlaps" sense — both already skip their desktop mechanism below 1000px with considered fallbacks. Two real, smaller issues:
- Both checks run **once, at mount only** (`useGSAP`/`useEffect` reading `window.innerWidth` directly, no `matchMedia` listener). Rotating a device, or resizing a window across the threshold, does not re-evaluate — the component is stuck in whichever mode it happened to mount in.
- The threshold (1000px) doesn't match any Tailwind breakpoint used elsewhere in the project (`sm`640/`md`768/`lg`1024/`xl`1280).
- Unverified-by-me, worth a real check during implementation: at ~1000px minus padding, `HeroScatter`'s fallback lays 3 cards out `flex:1` at `aspect-ratio: 5/7` (`card-reveal.module.css:42-45`) — on a 375-428px phone that's roughly 100-120px per card. I did not check whether the category titles rendered inside (`CardFace`'s title text) actually fit that width without awkward wrapping; flagging as something to visually confirm, not asserting it's broken.

### Section 5 — ScrollPath

Not a crash or scroll-hijack risk (this mechanism doesn't pin or capture input, it just scrubs a stroke offset against normal scroll — inherently one of the safer patterns here). The likely bug is purely visual: the path's plotted coordinates (`scroll-path.tsx:217`) are tuned to the *desktop* `lg:flex-row` row geometry per the component's own doc comment; below `lg` the rows stack (`flex-col`) into a much taller block, so the decorative path almost certainly drifts out of alignment with the rows it's meant to visually thread through. I could not confirm the exact degree of drift without rendering the page — the existing `w-[275%]`/`top-[15svh] lg:top-[25svh]` treatment suggests someone already fought this problem partially, but the underlying `d` coordinates were never swapped for the stacked layout, which is the part that actually determines whether the line tracks the rows.

### Section 6 — GalleryWall

Not broken. Already has a purpose-built, CSS-only mobile layout.

### Section 7 — CaseStudyCard

Not broken. `whileInView` is already the correct, universally-safe pattern.

---

## 3. Signals of existing mobile intent

- The card-reveal family's `1000px` threshold is a real, deliberate, CSS+JS-coordinated breakpoint — not an accident. It's close to (but doesn't match) Tailwind's `lg` (1024px), suggesting whoever built it independently converged on almost the same number by feel/testing.
- `GalleryWall`'s `640px` breakpoint matches Tailwind's `sm` exactly, and is a genuinely different, purpose-built layout (not just a resize) — the strongest existing precedent for "restructure content for mobile" in the codebase.
- `HANDOFF.md` §7 (the horizontal-scroll rework brief that produced today's `PinnedTrack`) explicitly listed *"what happens on touch/mobile — worth confirming this is understood as a bonus of the correct approach"* as an open question for whoever built it. Nothing in the current `PinnedTrack`/`HorizontalScrollHome` code shows that question was ever answered — there's no width check, no touch-specific comment, no mobile-specific test note anywhere in this file's otherwise extremely thorough doc comments (which do carefully address trackpad-vs-wheel speed, keyboard "End" presses, and scrollbar-thumb dragging — real edge cases were clearly tested — but never a touch/mobile pass). This strongly suggests mobile was simply never explicitly designed for on this component, rather than deliberately deferred.
- No commented-out or dead mobile-specific code exists anywhere in these components (verified via grep) — there's no abandoned prior attempt to clean up, this would be new work.

---

## 4. Recommendations, section by section

| Section | Approach | Justification (short) | Trade-off | Open question |
|---|---|---|---|---|
| **1. Home pin** (`HorizontalScrollHome`/`PinnedTrack`) | **(a) Re-express natively.** Make the plain vertical-stack fallback (already built, currently reduced-motion-only) the mobile default, with per-panel `whileInView` reveals replacing the pin/translate. | Fixes the content-clipping bug at the layout level (a normal stack has no fixed-height clip box) — simplifying (b) wouldn't fix that, it's not a "too much JS" problem. Replacing with a swipe carousel (c) reintroduces the exact carousel pattern the user already rejected once for desktop (`HANDOFF.md` §7) — not mine to reintroduce for mobile without asking. | Loses the "sideways journey" spatial device entirely on mobile; becomes 5 normal sections with gentle reveals. Real simplification, but the common, low-risk, well-understood mobile pattern — acceptable given the alternative is clipped content or scroll-jank. | Does the blog-marquee's "cards peel away" motif need any echo on mobile, or is a plain swipe strip enough? (See next row.) |
| **2. Blog marquee** (`BlogMarquee`) | **(c) Replace entirely.** Native `overflow-x-auto` (+ optional `scroll-snap-x`) swipeable strip, reusing the existing `CardFace`/`StaticGrid` card markup — no smooothy, no `pinScrollVh`, no rotate/scale/fade choreography. | The peel effect has no meaning without the pin it's entangled with (#1); manually re-driving `Core.target` from raw touch deltas would mean building a second, parallel input system for a decorative effect. A native scroll container is the zero-JS, battle-tested pattern for "browse N cards," and fully sidesteps every Lenis/touch/pin risk above. | Loses the choreographed peel-and-rotate exit entirely on mobile — a real, visible downgrade to a generic swipeable-cards look. Accepted because no mobile-safe equivalent preserves the mechanic without reinventing pin+scrub, which is the exact fragility being avoided. | Should the bonus/joke cards (08/09) still appear at the end of the mobile strip? (Recommend yes — matches the existing reduced-motion `StaticGrid` precedent of always showing them.) |
| **3. HeroScatter** (Work) | **(d) Keep as-is, fix what's broken.** Keep the existing static/no-scatter fallback; swap the mount-only `window.innerWidth` check for the shared resize-aware hook (§5) and align to the shared breakpoint. | The existing fallback is well-designed and coordinated with CSS already — nothing here needs a redesign, just to stop being stale on resize/rotation. | None — the fallback already shows 100% of the real content, this is a pure behavior fix. | Confirm at real 375-428px widths that the 3 card titles don't wrap awkwardly at ~100-120px card width (unverified by me). |
| **4. PinnedReveal** (Work) | **(d) Keep as-is, fix what's broken.** Same fix as #3: swap to the shared hook, align threshold. This fallback is already the strongest one in the codebase. | Same reasoning as #3 — no content loss, no redesign needed, only the detection mechanism is stale. | None. | None beyond the shared breakpoint question (§6). |
| **5. ScrollPath** (About) | **(b) Simplify.** Keep the scrub-linked draw mechanic (cheap, already scroll-safe, doesn't hijack input) but don't keep the exact desktop `d` path below `lg` — either re-plot a mobile-specific path against the real stacked-row geometry, or simplify to a much plainer accent line. | The mechanic itself isn't the risk (no pin, no scroll capture); the specific artwork is provably geometry-dependent on a layout mobile doesn't share, so (d) risks a visibly drifting decoration. (a)/(c) aren't warranted — nothing about the *mechanism* is unsafe on mobile, only the plotted coordinates. | Re-plotting preserves the "hand-drawn thread through the rows" feel most faithfully but costs real design effort; a generic accent line is cheap but less distinctive. This is a design call, not just engineering — see open question. | **Needs your call**: re-plot the path for mobile's stacked geometry, or simplify to a generic accent? |
| **6. GalleryWall** (About) | **(d) Keep as-is.** No changes. | Already has a purpose-built, CSS-only mobile layout — nothing to fix. | None. | None — include only in the final verification pass. |
| **7. CaseStudyCard** (`whileInView`) | **(d) Keep as-is.** No changes. | Already the correct, universally-safe pattern. | None. | None. |
| **Footnote — SecretReveal** (Home panel 1, mouse-only) | Not in scope as a full row (not scroll-driven), but flagging: content is currently just invisible on touch, nothing crashes. | — | Low-stakes either way. | Leave as a desktop-only easter egg, or add a tap-to-reveal fallback for touch? |
| **Footnote — DraggablePhoto** (Home panel 1) | No action needed beyond what #1's redesign naturally does. | Already has correct `touch-none` + Framer pointer-drag handling. Once panel 1 stops being a tightly pinned sticky box, its drag zone competes with less. | — | Worth a real-device gesture check post-implementation, not a design question. |

---

## 5. Cross-cutting decisions

### Breakpoint strategy — **recommend one shared threshold, not per-component**

Evidence of current drift: card-reveal family uses a hand-picked `1000px`; `ScrollPath`'s own layout already switches at Tailwind's `lg` (1024px); `GalleryWall` switches at Tailwind's `sm` (640px, a different kind of decision — column count, not "does this get scroll-jacking at all"); nothing ties any of these together.

**Recommendation: `1024px` (Tailwind's `lg`)**, as a single exported constant used everywhere a component decides "does this device get the desktop scroll mechanism at all" (Home pin, blog marquee, HeroScatter, PinnedReveal, and the Lenis on/off switch below). Reasoning:
- It's almost exactly what the card-reveal family already independently converged on (1000px) — real evidence this is roughly the right number for "does this still have room to behave like desktop," not just Tailwind's default.
- Tablet widths (iPad portrait ≈768-834px, landscape ≈1024-1194px) are precisely the ambiguous range for scroll-jacking mechanisms that need generous width to read as intentional. Using `md` (768px) would force iPad-portrait users into the full desktop pin/scatter/scrub stack — the exact regime the existing 1000px guard was already written to avoid.
- `GalleryWall`'s `sm`/640px breakpoint is a different question (how many columns fit) and should stay exactly as it is — this recommendation is only about the "which scroll mechanism runs" decision, not every responsive class in these components.

### Detection mechanism — **client-side hook, matching `use-reduced-motion.ts`'s existing pattern, not CSS-only**

Recommend a new `utils/use-is-mobile-scroll.ts`, built identically to the existing SSR-safe hook: `useState(false)` initial, `useEffect` reads `window.matchMedia('(max-width: 1023px)')`, subscribes to its `change` event for live updates, returns the boolean. Every component in §5's table consumes this one hook instead of a bespoke `window.innerWidth` check.

**Why not CSS-only:** these aren't "show box A, hide box B" swaps — they're "construct an entire ScrollTrigger pin / smooothy instance / Framer scroll subscription, or don't" decisions. A `hidden lg:block` wrapper still lets the underlying mechanism construct and run underneath — still consuming CPU, still holding scroll listeners, still capable of the exact touch conflicts being avoided. Only a JS-level branch actually stops the mechanism from being built at all, which is why the codebase already does this correctly for reduced-motion (`HorizontalScrollHome`, `BlogMarquee`, `PinnedReveal` all branch between two entirely different component trees in JS, not CSS) — this should follow the same proven shape.

**Hydration-mismatch risk:** identical in kind to what `use-reduced-motion.ts` already solved — `matchMedia` doesn't exist during SSR, so first paint must render a fixed default and only switch after a mount effect confirms the real viewport. Recommend the same posture already used site-wide: server and first client paint always render the plain/mobile-safe branch, upgrading to the desktop mechanism after mount only if the hook resolves to "not mobile." This means desktop users get one harmless frame of the plain layout before upgrading — already true today for reduced-motion, and already accepted in this codebase as the right trade-off.

**One risk this hook has that reduced-motion didn't:** viewport width changes mid-session in ways `prefers-reduced-motion` essentially never does (resize, orientation flip, DevTools panel toggle) — the `change` listener isn't optional here, and every consumer needs to cleanly tear down whichever mechanism was active when the boolean flips, not just re-render. This is genuinely more state-transition surface than the existing hook had to handle, and it's exactly the class of bug the card-reveal family's mount-only checks already got wrong once — worth explicit test attention (§7), not an assumption that "mount once" is good enough.

### Library ownership on mobile

- **Lenis: off.** Same early-return pattern already used for reduced-motion (`smooth-scroll-provider.tsx:42`), now also keyed off the shared mobile breakpoint. Native scroll everywhere on mobile. This directly removes the single biggest named risk (iOS momentum conflict) and is safe precisely because nothing left on mobile (once §4's recommendations land) actually needs Lenis's scroll-position control.
- **GSAP + ScrollTrigger:** stays, but mobile-scoped to the lightweight, non-pinning case only — `ScrollPath`'s simplified mobile draw. The pin/scatter mechanics (`HeroScatter`, `PinnedReveal`) simply never construct their triggers below the breakpoint, exactly as already coded today.
- **smooothy:** becomes desktop-only. The mobile blog-marquee replacement needs no scroll library at all (native `overflow-x-auto`).
- **Framer Motion:** the primary mobile animation workhorse — `whileInView` reveals (already proven safe via `CaseStudyCard`/`GalleryWall`) become the mechanism for the new per-panel Home reveals too.
- **Code-splitting note:** once smooothy and the pin-specific GSAP paths no longer construct on mobile, dynamic-`import()`-ing them so mobile bundles don't pay for unused code is a real, worthwhile follow-up — not a blocker for the correctness-focused first pass.

### Performance concerns worth designing around from the start

- **Lenis vs. iOS momentum scroll** — addressed by turning it off on mobile (above).
- **ScrollTrigger recalculation on resize** — mobile browsers fire `resize` (and force relayout) on address-bar show/hide during ordinary scrolling, a mobile-only quirk desktop testing won't surface. Whatever ScrollTrigger instances remain on mobile (`ScrollPath`) should use `ScrollTrigger.config({ ignoreMobileResize: true })`, which exists specifically for this.
- **GPU cost of simultaneous transforms** — `HeroScatter`/`PinnedReveal` animate several properties across multiple elements at once (x/y/rotate/scale/opacity, plus a portal-mounted fixed layer); this is exactly why "no animation at all below the breakpoint" (the existing static fallback) is the right call rather than trying to run a lighter version of the same transform stack on weaker mobile GPUs.
- **smooothy's unconditional rAF loop** — `slider.update()` runs every frame while mounted regardless of whether `target` is moving; moot once it's desktop-only, but is the reason it shouldn't be left "running quietly" as a mobile fallback either.

### Testing / verification approach

Given this environment has no real-device lab or configured BrowserStack (nothing in `package.json` suggests one), and `HANDOFF.md` documents Playwright already used ad-hoc for viewport/reduced-motion screenshot verification in a prior session:

1. **Use Playwright's real device-emulation profiles** (`devices['iPhone 13']`, `devices['Pixel 7']`, etc.), not a resized desktop browser window. This matters specifically here — several of the bugs above are touch-*input*-shaped (Lenis's touch handling, `BlogMarquee`'s disabled drag, `DraggablePhoto`'s `touch-none`), not just narrow-*viewport*-shaped, and a resized desktop Chrome window still dispatches mouse events, which would make those bugs invisible even at the right pixel width.
2. Test at 375/390/428 (as named in the brief) **and** 768/834/1024 (tablet portrait/landscape) — the recommended breakpoint sits at 1024, and tablet is where the real ambiguity lives.
3. Test both a normal pass and a `reducedMotion: 'reduce'` context pass per viewport, matching the existing documented practice — mobile × reduced-motion is a combination that's never been exercised in this codebase before.
4. Test a mid-scroll resize/rotation, specifically to catch whether the mobile/desktop branch tears down its mechanism cleanly when the hook's boolean flips mid-session (the risk named in §5).
5. **Real-device spot check remains a recommended manual follow-up**, specifically on iOS Safari — the Lenis/momentum-scroll risk is a Safari-specific failure class that even Playwright's WebKit engine doesn't perfectly reproduce. If no physical iPhone is available, at minimum run the Playwright **WebKit** project (not just Chromium) for this pass, and treat a real-device check as outstanding rather than implicitly covered by automation.

---

## 6. Proposed implementation order

1. **Shared infrastructure** (small/contained) — `utils/use-is-mobile-scroll.ts` + the shared `1024px` breakpoint constant. Nothing downstream can be built correctly without this.
2. **Lenis mobile-off switch** (small/contained) — one change to `SmoothScrollProvider`, removes the single biggest cross-cutting risk immediately, nothing else depends on Lenis staying mobile-active.
3. **Home page + blog marquee together** (redesign-scale) — highest current risk (real content-clipping bug, most complex interaction), and the two components' mobile paths are entangled (the marquee's swipe-strip replacement only makes sense once Home stops trying to pin it) — should ship as one unit, not split.
4. **HeroScatter + PinnedReveal** (small/contained) — mostly rewiring already-built, already-proven fallbacks to the new shared hook and threshold. Low risk.
5. **ScrollPath** (contained, but blocked on your design call in §4) — sequence after the above since it's waiting on input, not because it's technically harder.
6. **GalleryWall + CaseStudyCard** — no changes; final verification pass only, to confirm they still look right once the Home redesign changes what sits above/around the About and Work page entry points.

**Redesign-scale:** Home page pin + blog marquee (entangled, ship together).
**Small/contained:** shared hook/breakpoint, Lenis switch, HeroScatter, PinnedReveal.
**Contained but blocked on your input:** ScrollPath.
**No change needed:** GalleryWall, CaseStudyCard.

---

## 7. Open questions, consolidated

1. **Blog marquee**: does the "cards peel away" visual signature need any preserved echo on mobile, or is a plain native swipe strip fully acceptable?
2. **Blog marquee**: should the bonus/joke cards (08/09) still appear at the end of the mobile strip? (I'd recommend yes.)
3. **ScrollPath**: re-plot the SVG path specifically for mobile's stacked row geometry (higher effort, closer to original intent), or simplify to a generic accent line (cheaper, less distinctive)?
4. **SecretReveal** (footnote, not core to this plan): leave as a desktop-only mouse easter egg, or add a tap-to-reveal fallback for touch?
5. **Breakpoint**: confirm `1024px` (Tailwind's `lg`) is acceptable as the shared "mobile mode" threshold for these components — this reclassifies tablet-portrait devices (e.g. iPad portrait, ~768-834px) into the simplified experience even though they might have room to look fine at full desktop fidelity. I believe the evidence supports this, but it's a real product-scope decision (more devices get the simplified path) worth confirming explicitly rather than discovering later.
