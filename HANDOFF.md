# Portfolio redesign — handoff / status document

> Written for another AI agent (or a human) picking this up. It documents exactly what has been built, why, and — most importantly — where it's known to be wrong or under-specified. Read the whole "Known problems" section before touching anything; it explains the two live complaints that triggered this handoff.

---

## 0. Why this document exists

Two prior specs (`v1` and `v2`, prose documents pasted directly into a Claude Code conversation — not preserved as files in the repo) were implemented in full, phase by phase, with build verification and Playwright screenshot checks after each phase. Everything in those specs is technically built and working. But the person driving this just flagged two problems with the latest work:

1. **The Home page's "sideways scroll" turned into a carousel, not what they wanted.** They asked for scroll to go sideways instead of downwards; what got built is full-panel, one-at-a-time, snap-to-slide navigation with dot indicators — mechanically a carousel/slider, even though it's driven by the scroll wheel instead of arrow buttons.
2. **Text/image placement across the site doesn't match "the reference."** No reference site, screenshot, or image has ever actually been shared in this build process — everything so far has been built from written prose specs only. This is a real gap: prose specs (however detailed) cannot convey exact spatial composition, proportions, or layout rhythm the way a visual reference can. **The next agent should get an actual reference (URL, screenshot, Figma, whatever it is) before trying to fix placement**, or this will keep missing the mark by feel.

Nothing below should be treated as "done and untouchable" except where explicitly marked ✅ confirmed-correct by the user mid-build. Most of it is "built to written spec, never checked against a visual reference."

---

## 1. Stack & environment facts (confirmed, don't re-derive)

- **Next.js App Router**, TypeScript, React 19.
- **Tailwind CSS v4**, CSS-first config — tokens live in `@theme` blocks inside `styles/tailwind.css`, not in `tailwind.config.js` (that file still exists for `content`/`plugins`/legacy `fontSize` but is not where new tokens go).
- **`framer-motion`** (`^12.x`) was already a dependency before this work started; used for every animation in the new system.
- Dark mode has been **fully removed** — `next-themes` is uninstalled, `ThemeToggle`/`sun-icon`/`moon-icon` deleted. Do not reintroduce a toggle without the user explicitly asking; this was a deliberate call (see §5).
- `/projects` now permanently redirects to `/work` via `next.config.ts` `redirects()`.
- `/blogs` and `/certifications` still exist, still work, are **intentionally off the new nav** (they still use their old visual style — zinc/teal, not the new ivory system — this is deliberate, not a bug; see §5).
- **Repo-local build quirk**: in this sandboxed dev environment, `next build` / `next dev` fail to fetch Google Fonts (`Fraunces`, `Inter`) over TLS unless run with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` set. This is very likely a sandbox-specific cert-store issue, not a real problem on the user's own machine or on a normal deploy target (Vercel etc.) — but if `next build` mysteriously fails on "Failed to fetch `Fraunces` from Google Fonts", try that env var before assuming something is broken in the code.
- Nothing in this repo has been committed by the agent — all work described below is uncommitted working-tree changes on branch `manjush/task/refactoring-files`.

---

## 2. Design tokens (confirmed correct, keep as-is)

Defined in `styles/tailwind.css`, both as raw CSS custom properties on `:root` and mirrored into a Tailwind v4 `@theme` block (so they're usable as `bg-bg`, `text-ink-dim`, etc.):

```css
--bg: #faf9f4;          /* warm ivory page background */
--ink: #141412;         /* primary text */
--ink-dim: #737169;     /* secondary text — CHANGED from the original spec's #8c8a80.
                            #8c8a80 only hit 3.29:1 contrast against --bg, failing WCAG AA
                            at the 12–13px sizes it's used at. #737169 hits 4.64:1. Keep
                            this value; do not revert to #8c8a80. */
--line: #e6e3d8;         /* hairline dividers */
--line-strong: #cfccbe;  /* ghost-word echo color, stronger dividers */
--accent: #d1591f;       /* burnt orange, spent sparingly */
--accent-ink: #5c260c;   /* darker accent for text-on-light (accessible contrast, 11.46:1) */
```

**Typography**: Fraunces (display/headings, via `next/font/google` in `utils/fonts.ts` as `fraunces`, weights 400/500/600, italic+normal) + Inter (body/UI, `inter`, weights 400/500/600). Both exposed as CSS variables (`--font-fraunces`, `--font-inter`) and mapped to `--font-display`/`--font-sans` in the `@theme` block.

**Ghost-word type treatment** (used for every page's main heading): two CSS classes in `styles/tailwind.css`:
- `.ghost-word-top` — Fraunces 600, `clamp(2.9rem, 8vw, 6.75rem)`, line-height 0.94, color `--ink`.
- `.ghost-word-echo` — Fraunces 400 italic, same size, color `--line-strong`, `margin-top: -0.08em`.

**Motion-related CSS**: `@keyframes pulse-soft` (availability dot) and `@keyframes settle` defined in the `@theme` block as `--animate-pulse-soft`/`--animate-settle`; a global `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; ... } }` blanket fallback; `.hide-scrollbar` utility (for the horizontal-scroll container, see §7 problem); `html.cursor-hidden` rule (see custom cursor).

---

## 3. Global shell (confirmed correct, keep as-is)

All under `components/`:

- **`site-nav/site-nav.tsx`** + **`site-nav/mobile-menu.tsx`** — fixed top nav, `26px 40px` padding (responsive). Three-column grid: wordmark ("Manjush", links home) / centered inline nav ("Work, About, Contact" as one comma-joined sentence, current page bold+`--ink`, others `--ink-dim`) / right-aligned social text links ("Github  LinkedIn  Email"). Mobile collapses to a `@headlessui/react` Popover menu. Nav links use `TransitionLink` (see §6), not plain `next/link`.
- **`site-footer/site-footer.tsx`** — fixed to viewport bottom, `© 2026 Manjush R Menon` left, a tagline right ("Currently rebuilding this site, in the open" — placeholder copy, fine to change).
- **`ghost-header/ghost-header.tsx`** — reusable component wrapping the `.ghost-word-top`/`.ghost-word-echo` pattern. **Note**: most pages actually inline the spans directly rather than using this component, because they needed per-line `motion.span` stagger control that the generic component doesn't expose. The component itself is correct but under-used; worth deciding whether to extend it to accept per-line motion props or just accept the inlining pattern as the norm.
- **`index-label/index-label.tsx`** — renders `"01/"` etc., 13px, `--ink-dim`.
- **`availability-badge/availability-badge.tsx`** — pulsing green dot (`#4c9a5a`, 6px→scaled to `h-1.5 w-1.5` i.e. 6px) + "AVAILABLE FOR WORK — KOCHI, IN" uppercase label. Pulse respects reduced motion (uses local `utils/use-reduced-motion.ts` hook, not framer's — see §8 for why that distinction matters).
- **`cursor/dual-cursor.tsx`** — dot (5px, `--ink`) tracks exactly; ring (30px, 1px `--ink-dim` border) trails via `requestAnimationFrame` lerp (factor 0.18); ring shrinks to 14px + turns `--accent` on hover over `a`/`button`. Desktop-only — checks `matchMedia("(pointer: coarse)")` before even mounting the mousemove listener. Respects reduced motion (ring snaps 1:1, no lerp, if `prefers-reduced-motion: reduce`). z-index is `z-[70]`.
- **`page-transition/`** — the curtain system, see §4.

---

## 4. Page transition curtain (confirmed correct as of last check)

Files: `components/page-transition/transition-context.tsx`, `transition-provider.tsx`, `transition-link.tsx`, `page-settle.tsx`. Wired in via `app/providers.tsx` → `TransitionProvider`, mounted in `app/layout.tsx`.

**Mechanism**: `TransitionLink` wraps `next/link`'s `Link`, intercepts click, calls `startTransition(href, () => router.push(href))` from context instead of navigating immediately. `TransitionProvider` then:
1. Shows a `fixed inset-0` div, solid `#121212` background, `z-[80]` (above the cursor's `z-[70]` — this was a real bug fixed mid-build, the cursor used to render on top of the curtain), opacity animated 0→1 over 350ms.
2. Destination page name (from `PAGE_NAMES` map in `utils/site-links.ts`) shown centered, `text-2xl sm:text-3xl`, `tracking-[0.3em]`, uppercase, `#f2ede2` on the black — **this was also a real bug fix**: it started at `text-xs` (13px), way too small to read as a "title card"; bumped to the current size.
3. Holds ~175ms, then the actual `router.push` fires.
4. On pathname change, waits 60ms (let new content mount underneath), then fades the curtain out over 250ms.
5. Separately, `page-settle.tsx` wraps all page content in `<main>` and does a `translateY 14px→0, opacity 0→1, 400ms ease-out` on every route change, keyed by pathname.

An `aria-live="polite"` region announces the destination name once per transition. Reduced motion cuts all curtain durations to ~50ms (curtain still shows, per spec instruction — "the destination label is a functional loading indicator, don't remove it, just make it fast").

**Verified via Playwright**: sampled the overlay's computed background color mid-hold and got `rgb(18,18,18)` (`#121212`) — confirmed genuinely opaque, not a cross-fade of the old page. If this regresses, check z-index stacking first (something else creeping above `z-[80]`) and check that the curtain's `opacity` animation isn't being sampled mid-transition when judging "is it solid" (a screenshot taken 150ms into a 350ms fade will look dim/gray — that's not a bug, that's just an in-progress fade).

---

## 5. Decisions already made by the user (do not re-litigate without cause)

These were explicit answers to explicit questions asked during the build. Re-asking them wastes the user's time — treat them as settled unless something has genuinely changed:

- **Dark mode: removed entirely.** Reasoning given: "the whole redesign is built around one considered palette... a toggle means designing and maintaining a second version of every token, and it dilutes the restraint that's the actual point of this system."
- **`/blogs` and `/certifications`: left live, deliberately off the new nav, not restyled.** Reasoning: "don't delete content, don't force them into a spec that wasn't written for them." Folding certifications into About is a flagged *future* task, not now.
- **`/projects` → `/work`: single canonical route, old one redirects.**
- **Contact form: kept, restyled (underlined inputs, no card/border), demoted to a secondary path below the direct email/social rows.** It's real EmailJS infra, not decorative.
- **Home photo: uses the existing `images/hero-section-image.png` asset**, not a placeholder. No new photo asset has been supplied.
- **Phone number: removed from public display entirely** (was `+91 90612 67198` in `utils/contact-info.ts`). Reasoning: "already public ≠ should keep publishing... a public GitHub repo is more heavily scraped." The contact *form* still asks visitors for their own optional phone number — that's unrelated, still present, not a PII issue.
- **Work page teaser project (Home section 03): ArtConnect, not Morent, not both.** Reasoning: "ArtConnect has actual stakes... Morent's story is 'did a training exercise to learn Next.js' — true, but flat."
- **Home closing statement copy**: *"Most of what I build and most of what I shoot start the same way — paying attention to the small stuff."* — user's own pick from three options offered, explicitly chosen over a more "agency copy"-sounding draft. Don't polish this into something more aphoristic; the plainness was the point.
- **Home section scroll behavior**: originally asked "scroll-snap vs natural scroll" — user said natural scroll was fine as a default. **This has since been superseded by the sideways-scroll request that triggered this handoff — see §7.**
- **Idle icon visual concept** (circle-in-square "dial" + rounded-shape-with-two-dots "face"): accepted as a fine placeholder concept, cheap to swap later.

---

## 6. Full component/file inventory

### New files (all untracked in git, i.e. brand new)
```
app/work/page.tsx
components/ambient-shape/ambient-shape.tsx
components/availability-badge/availability-badge.tsx
components/cursor/dual-cursor.tsx
components/draggable-photo/draggable-photo.tsx
components/ghost-header/ghost-header.tsx
components/horizontal-scroll/horizontal-scroll.tsx   ← the component causing the "carousel" complaint, see §7
components/idle-icons/idle-icon-pair.tsx
components/index-label/index-label.tsx
components/page-transition/transition-context.tsx
components/page-transition/transition-provider.tsx
components/page-transition/transition-link.tsx
components/page-transition/page-settle.tsx
components/scroll-section/scroll-section.tsx
components/site-footer/site-footer.tsx
components/site-nav/site-nav.tsx
components/site-nav/mobile-menu.tsx
data/work-data.tsx
utils/site-links.ts
utils/use-reduced-motion.ts
```

### Modified files
```
app/about/page.tsx        — full rebuild
app/contact/page.tsx       — full rebuild
app/layout.tsx              — new shell (SiteNav/PageSettle/SiteFooter/DualCursor/Providers)
app/page.tsx                — full rebuild, now the horizontal-scroll Home (§7)
app/providers.tsx           — stripped down to just <TransitionProvider>
components/contact-me/contact-input.tsx      — restyled (underlined, no border box)
components/contact-me/contact-me-section.tsx — stripped down to just the form (info dl removed, lives on the page now)
components/contact-me/contact-textarea.tsx    — restyled to match
components/contact-me/input-styles.ts         — restyled to match
next.config.ts               — added /projects → /work redirect
package.json / package-lock.json — next-themes removed
styles/tailwind.css          — all new tokens, ghost-word classes, keyframes, hide-scrollbar util
tsconfig.json                — auto-touched by Next.js tooling, not a deliberate edit
utils/contact-info.ts        — phone/postal address removed, restructured
utils/fonts.ts               — Bebas Neue → Fraunces + Inter
```

### Deleted files (all confirmed unused elsewhere before deletion)
```
app/projects/page.tsx
components/about-me-section/about-me-section.tsx
components/capabilities-section/capabilities-section.tsx
components/capabilities-section/capabilities-sub-sections.tsx
components/contact-me/contact-item.tsx
components/footer/footer.tsx
components/header/header.tsx
components/hero-section/hero-section.tsx
components/icon-components/{chevron-down,close,instagram,moon,sun}-icon.tsx
components/layout/layout.tsx
components/navigation/desktop-nav/*
components/navigation/mobile-nav/*
components/road-map/road-map.tsx
components/social-link/social-link.tsx
components/theme-toggle/theme-toggle.tsx
data/projects-data.ts
```

---

## 7. KNOWN PROBLEM #1 — Home page scroll is a carousel, not what was wanted

**File**: `app/page.tsx` (the 4 panels) + `components/horizontal-scroll/horizontal-scroll.tsx` (the mechanism).

**What was asked for**: "i feel the scroll should happen to side ways not downwards for the home page." No further detail was given at the time.

**What got built**: `HorizontalScroll` wraps the 4 Home sections in a flex row inside a `overflow-x-auto` container with `scroll-snap-type: x mandatory`. A `wheel` event listener converts vertical wheel/trackpad deltaY into `container.scrollBy({ left: deltaY })`. Each of the 4 sections is a full-viewport-width (`w-full shrink-0`) panel with `scroll-snap-align: start`. Small clickable dot indicators at the bottom track/jump between the 4 panels via `scrollTo`.

**Why this is wrong**: mechanically, this is a slide-based carousel — discrete full-screen slides, snap points, prev/next dot navigation. That reads as a component pattern (image carousel, slideshow), not as "the page happens to scroll sideways." It was rejected as "made it into a carousel kind of thing."

**What was probably actually wanted** (a guess — the next agent should confirm with the user rather than assume): the more common "sideways-scrolling portfolio" pattern is **scroll-driven horizontal translation** — the page still scrolls *vertically* as the user scrolls normally, but a horizontally-laid-out track is pinned (`position: sticky`) within a tall vertical scroll region, and its `translateX` is driven continuously/fluidly by vertical scroll progress (often via `useScroll` + `useTransform` from framer-motion, mapping vertical `scrollYProgress` of a tall wrapper to a horizontal `x` transform on the inner track). This is what sites like Apple's product pages, many awwwards-style studio portfolios, etc. do. Characteristics that distinguish it from what was built:
- Motion is continuous and scrubbable (scrolling a little moves the content a little, in either direction, at 1:1 or eased rate) — not discrete jumps between fixed states.
- No snap-to-slide, no dot pagination (or if there is a position indicator, it's a subtle scroll-progress bar, not carousel dots).
- Content can be composed with items at different depths/sizes overlapping across the horizontal track, not strictly one-full-screen-panel-per-idea.
- It fundamentally still *is* a vertical scroll gesture (mouse wheel, trackpad, touch swipe all behave exactly as users expect for a normal page) — the sideways motion is a translation of that input, not a hijacking into a different interaction model.

**framer-motion has first-class support for this pattern** (`useScroll({ target: containerRef })` → `scrollYProgress` → `useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])` applied as `x` to a flex row, with the container itself given enough vertical height, e.g. `height: 400vh`, so there's enough scroll distance to drive the full horizontal traversal, with the track `position: sticky; top: 0` inside it).

**Action for next agent**: before rebuilding, get explicit confirmation from the user on:
1. Is the scroll-driven horizontal-translate pattern (described above) actually what they mean? Show them a reference if possible, or describe the mechanism in plain terms and confirm.
2. Should section entrances (the existing per-element fade/stagger animations already built for each of the 4 sections — badge, ghost header, meta row, instruments stack, etc.) survive, or does content need to be re-thought for a continuously-scrubbing layout where elements might be visible at the edges of the viewport during the scroll rather than snapping fully into place?
3. What happens on touch/mobile — this pattern typically still works with normal vertical touch-scroll (it's still fundamentally a vertical scroll, just visually re-rendered as horizontal motion via CSS transform), which is actually a mobile-UX *advantage* over the carousel approach (no swipe-direction confusion). Worth confirming this is understood as a bonus of the correct approach.

**Do not** just reduce panel count, change snap type, or fiddle with the dot indicators — the fundamental interaction model (discrete slide-jumping vs. continuous scroll-scrubbing) is the actual complaint, not the details of the current implementation.

---

## 8. KNOWN PROBLEM #2 — Layout/placement doesn't match "the reference"

No visual reference (URL, screenshot, image, Figma link) has been shared at any point in this build. Everything — Home, Work, About, Contact, the nav, the footer — was built purely from written prose specs (two long markdown documents pasted into the conversation, describing copy, tokens, and behavior in words, with only rough layout hints like "top row splits into two — left holds X, right holds Y").

This means:
- Exact spacing, proportion, alignment, and visual rhythm were all agent judgment calls, not reference-matched.
- The user has referenced "the reference site" a few times (e.g. "matches the recurring-wordmark motif from the reference site" in the v2 spec, and the closing-statement copy was compared to "Douglus's 'Crafting elegant solutions to complex problems'" — implying a specific real portfolio site was the visual inspiration throughout) but **the actual reference itself has never been provided to the agent**.

**Action for next agent**: ask the user directly for the actual reference — a URL is best (can be fetched/screenshotted), otherwise images. Do not attempt to fix "placement" by guessing harder from the same prose specs; that will just produce another plausible-but-unvalidated layout. Once a reference exists, do a side-by-side comparison (screenshot the current build at the same viewport size as reference screenshots) before making changes, and check with the user after each significant layout change rather than batching many guesses together.

---

## 9. Page-by-page current state (for quick orientation)

### Home (`/`) — `app/page.tsx`
4 sections, currently wrapped in the carousel-style `HorizontalScroll` (§7, needs rework):
1. **Intro** — availability badge, ghost header "Manjush Menon" / *"frontend developer"*, subhead paragraph, 3-item meta row (`03 yrs experience` / `React/Next.js/TypeScript primary stack` / `Kochi, open to remote`), draggable photo (`components/draggable-photo/draggable-photo.tsx` — framer-motion `drag`, velocity-derived motion blur via `useVelocity`+`useTransform`, "Drag me" label that fades after first interaction, fully static+non-draggable under reduced motion via a mount-gated pattern — see §10 for why that pattern matters).
2. **Instruments** — "REACT" (accent) / "TYPESCRIPT" / "NEXT.JS" stacked words, idle icon pair (`components/idle-icons/idle-icon-pair.tsx` — rotating dial + blinking face, both frozen under reduced motion), supporting line, "More about me →" link to `/about`.
3. **Work teaser** — ghost header "Payment" / *"module"* (ArtConnect reference, per §5 decision), 2-line teaser copy, "View work →" link to `/work`.
4. **Closing** — italic Fraunces statement (per §5 decision), large "Manjush Menon" display text, ambient accent-tinted shape behind it, "Get in touch →" link to `/contact`.

Ambient shapes (`components/ambient-shape/ambient-shape.tsx`) sit behind sections 2 (neutral) and 4 (accent) — soft blurred radial divs, low opacity, `aria-hidden`, `pointer-events-none`. Note: don't nest an `AmbientShape` inside a container with `overflow-hidden` unless the shape is fully contained within it — the blur gets hard-clipped at the overflow boundary instead of fading softly (this bit us once already; fixed by removing `overflow-hidden` from the section-4 wrapper).

### Work (`/work`) — `app/work/page.tsx`, data in `data/work-data.tsx`
Confirmed matching spec, not touched since. Index `01/`, ghost header "Selected" / *"work"*, honest intro line about no live links/screenshots. Two entries (ArtConnect, Morent) each with an inline SVG glyph, role, brief/build/result paragraphs, tech tag list. Scroll-reveal via `whileInView` (framer-motion built-in, not the custom `ScrollSection` component — see §10 for why that distinction is safe here but wouldn't have been on Home).

### About (`/about`) — `app/about/page.tsx`
Index `02/`, ghost header "Manjush" / *"R Menon"*, ambient neutral shape behind it. Two-column bordered capabilities list (Frontend / Craft — a third category was explicitly left out per user instruction: "do not pad this out artificially"). Interests section (index `03/`): Football and Photography & film paragraphs, each with exactly one accent-colored phrase (`MVP in a tournament match`, `watching films differently`) — deliberately restrained, "do not add more emphasis than this."

### Contact (`/contact`) — `app/contact/page.tsx`
Index `04/`, no ghost-header component used — instead a large stacked word column (BUILD / **SHIP** (accent) / FRAME / CONNECT) wrapped in an `h1` for a11y. Info column: "Get in touch" eyebrow, one-line intro, then Email/Based/Github/LinkedIn rows (no phone, per §5) with hairline dividers. Below that, the restyled EmailJS form (`components/contact-me/contact-me-section.tsx`) as a secondary, visually quiet path.

---

## 10. Accessibility/technical gotchas worth knowing before touching motion code

- **`useReducedMotion` from `framer-motion` is NOT SSR-safe for anything that changes DOM structure or `initial` values.** It resolves differently between server render and first client paint, which caused a real hydration-mismatch bug (caught via a Playwright pass with `reducedMotion: "reduce"` context — console showed a genuine React hydration error). Fixed in two places:
  - `DraggablePhoto` — now always renders the same static structure on server + first client paint, and only upgrades to the interactive/draggable version in a `useEffect` after checking `window.matchMedia` directly (not via the framer hook).
  - `PageSettle` — the `initial.y` value used to be `reduced ? 0 : 14`; changed to always be `14` (constant), with only the `transition.duration` varying by reduced-motion state. Varying `transition` timing is safe (not serialized into SSR output); varying `initial`/structure is not.
  - `utils/use-reduced-motion.ts` (a hand-rolled hook: `useState(false)` + `useEffect` reading `matchMedia`) is the SSR-safe pattern used elsewhere (e.g. `AvailabilityBadge`) — it always starts `false` on both server and first client render, only flipping after mount, so there's never a mismatch. **Prefer this hook (or the same mount-gated pattern) over framer's `useReducedMotion` for anything that isn't just tweaking a `transition.duration` number.**
- `ScrollSection` (`components/scroll-section/scroll-section.tsx`) implements progressive-enhancement scroll-reveal deliberately: content is visible-by-default (both SSR and first paint), and only drops into a `hidden` state in a `useEffect`-gated way before being revealed by `IntersectionObserver`. This was a specific accessibility requirement from the v2 spec: "content should not depend on the IntersectionObserver firing to become visible/readable." Work and About pages use framer-motion's built-in `whileInView` instead (simpler, was already ✅-confirmed correct before this requirement was written, left as-is) — that's a minor inconsistency between pages but not flagged as a problem by the user, just noting it exists.
- `--ink-dim` contrast was fixed once already (§2) — if it gets changed again, re-run a contrast check against `--bg` at 12–13px, needs ≥4.5:1 for WCAG AA.
- The custom cursor (`DualCursor`) must stay checking `matchMedia("(pointer: coarse)")` *before* mounting any mousemove listener — not just hiding via CSS — per explicit spec instruction to avoid wasted listeners on touch devices.

---

## 11. How to verify changes (what's been used so far)

- `npm run build` (prefix with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` in this sandbox if font-fetch fails — see §1).
- `npm run lint` is **broken on a pre-existing basis, unrelated to this work** (ESLint 9 config error: `TypeError: Plugin "js" not found`). Confirmed via `git stash` that it fails identically on the pre-redesign code. Not this agent's bug to fix unless asked.
- No test suite exists in this repo.
- Visual verification so far has been done by starting `npm run dev`, then driving a headless Playwright/Chromium session (installed ad-hoc via `npm install playwright` in a scratch directory, since neither `chromium-cli` nor a project-specific run skill were available in this environment) to screenshot pages and check `console`/`pageerror` events. A full run-through with `reducedMotion: "reduce"` context option is what caught the hydration bug in §10 — **always test both a normal pass and a reduced-motion pass**, they are not equivalent and bugs hide in the gap between them.

---

## 12. Suggested next steps, in order

1. **Get the actual visual reference from the user** (§8). Don't guess further.
2. **Clarify the intended Home scroll mechanism** (§7) — confirm the scroll-driven horizontal-translate pattern (or whatever it turns out to be) before writing code.
3. Rebuild Home's structure/placement against the reference once both of the above are resolved — this will likely mean discarding `components/horizontal-scroll/horizontal-scroll.tsx` entirely (or repurposing it into a `useScroll`/`useTransform`-driven pinned track) and re-checking whether the existing 4-section content/copy still makes sense in the new spatial layout, or whether the reference implies a different content structure altogether.
4. Everything in §3–§6, §9 (Work/About/Contact, global shell, curtain, design tokens) has been through at least one round of build + screenshot verification and was not part of the complaint — treat as a stable foundation, but still worth a quick visual sanity check against the reference once it exists, since "the reference" was never actually checked against *any* page, not just Home.
