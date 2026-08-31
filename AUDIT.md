# Codebase Audit — Manjush Portfolio (Next.js)

**Scope note:** the audit brief this report was requested against assumed a stack with Sanity, Supabase, Razorpay, and Zustand. None of those exist in this repo — this is a client-rendered Next.js 16 / React 19 portfolio site (GSAP, Framer Motion, Lenis, EmailJS for the contact form, no database, no auth, no payments, no CMS). Sections 4 and 5 below are rewritten against what's actually present; the Sanity/Supabase/Razorpay/Zustand subsections are marked N/A rather than fabricated.

**Read-only investigation.** No code was changed. Findings are grouped for a refactor-planning pass, most-actionable first within each severity tier.

Also relevant: `HANDOFF.md` (repo root) is a detailed handoff doc from a prior session, but it is **stale relative to the current working tree** — see Critical/High section. Read it for design-decision history, not as a description of current `app/page.tsx` / `app/about/page.tsx` / `app/contact/page.tsx`.

---

## 1. STRUCTURE

**Overall shape:** `app/` (routes) → `components/<kebab-case-folder>/<file>.tsx` (one component family per folder) → `data/*.ts` (static content arrays) → `utils/*.ts` (hooks + helpers). This is a sound, consistent convention and most of the repo follows it.

Where it drifts:

- **`data/` nesting is inconsistent.** Most data files are flat: `data/blog-marquee-data.ts`, `data/card-reveal-data.ts`, `data/case-studies-data.ts`. Two are wrapped in a same-named subfolder for no apparent reason: `data/blog-data/blog-data.ts` and `data/certificate-data/certificate-data.ts`. The second one also has a stale duplicate sibling at the flat location — see DEAD CODE. Pick one convention (flat, since it's 5-of-7) and collapse the two folder-wrapped ones into it.
- **`tailwind.config.js` is dead configuration.** Tailwind v4 is set up CSS-first in `styles/tailwind.css` (`@import "tailwindcss"`, `@plugin`, `@theme`, `@custom-variant`), and the one `@config` directive in that file points to `../typography.ts`, not `../tailwind.config.js`. That means `tailwind.config.js`'s `content` globs, `darkMode: "class"`, and custom `fontSize` scale are **not loaded by anything** — Tailwind v4 auto-detects content and the file is simply orphaned. Either wire it in via `@config '../tailwind.config.js'` (if the fontSize scale is still wanted) or delete it and fold anything still needed into `styles/tailwind.css`/`typography.ts`.
- **Root-level config sprawl**: `typography.ts` (Tailwind typography plugin config, TS) sits at repo root next to `tailwind.config.js` (also Tailwind config, JS) — two differently-named, differently-formatted config files doing adjacent jobs, easy to miss one when editing the other. Consider colocating both under a `config/` or `styles/` folder, or merging.
- **`styles/prisim.css` is misspelled** (should be `prism.css`) and is dead: the only reference to it is a commented-out `@import "./prism.css"` (correct spelling) in `styles/tailwind.css:2` — so even the commented-out line points at a filename that doesn't exist. Delete the file or fix+uncomment, whichever is intended.
- **`components/contact-me/`** (5 files: `contact-me-section.tsx`, `contact-input.tsx`, `contact-textarea.tsx`, `input-styles.ts`, `use-contact-form-validation.ts`) is currently **not rendered anywhere**. `app/contact/page.tsx:14-17` has an explicit comment explaining this is deliberate — the page was reworked around `BloomPanel` and this tree was "left ready to bring back." That's a legitimate in-progress state, not an accident, but it means there are now **two independent, fully-built contact-form implementations** in the tree (see DEAD CODE + CORRECTNESS below) and only one is live.
- **`README.md` is 100% unedited `create-next-app` boilerplate** (mentions the "Geist" font, which this project doesn't use — it uses Fraunces + Inter via `utils/fonts.ts`). Not a structural bug, but worth replacing before this is ever handed to another contributor.
- **Icon components vs. static SVGs overlap**: `components/icon-components/*.tsx` (React components) and `images/*.svg` (static assets: `gmail.svg`, `instagram.svg`, `linkedin.svg`, `whatsapp.svg`) both exist for the same icon set. Every image file is referenced at least once, so nothing here is dead, but it's worth confirming both are actually needed (e.g. one set used for `<Icon />` inline rendering, the other for `next/image`/OG-type use) rather than one being a forgotten leftover from a prior icon strategy.

**What's genuinely consistent and worth keeping as the house style:** kebab-case folder+file names, one component per folder, PascalCase named exports matching the component name, `"use client"` only on files that need it (see CORRECTNESS — this is mostly true), path aliasing via `@/*`.

---

## 2. DEAD / UNUSED CODE

Verified by grepping every import site across `app/`, `components/`, `data/`, `utils/` — not just filenames.

### Confirmed orphaned components (defined, exported, zero import sites anywhere)
| File | Export | Note |
|---|---|---|
| `components/ghost-header/ghost-header.tsx` | `GhostHeader` | Prior handoff doc even flags this as "under-used"; it's now fully unused — every page inlines the ghost-word spans directly instead. |
| `components/availability-badge/availability-badge.tsx` | `AvailabilityBadge` | Was part of the confirmed-correct nav shell per `HANDOFF.md`; current `site-nav.tsx`/`app/contact/page.tsx` don't use it (contact page inlines an equivalent dot+label block at line 198-206 instead). |
| `components/scroll-section/scroll-section.tsx` | `ScrollSection` | The SSR-safe, IntersectionObserver-based scroll-reveal component `HANDOFF.md` describes as a deliberate accessibility pattern. Not wired into any page — Work/About use Framer Motion's `whileInView` instead. |
| `components/grain/grain-overlay.tsx` | `GrainOverlay` | No import sites. |
| `components/page-under-construction/page-under-construction.tsx` | `PageUnderConstruction` (default) | No import sites. |
| `components/button/botton.tsx` | `Button` | Only consumer is `PageUnderConstruction` above — so this whole 2-file branch (`button/` + `page-under-construction/`) is dead together. **Filename typo**: `botton.tsx` should be `button.tsx`. |
| `components/icon-components/mail-icon.tsx` | `MailIcon` (default) | Superseded by `gmail-icon.tsx`, which is what `app/contact/page.tsx` actually imports. |
| `components/icon-components/git-icon.tsx` | `GitIcon` (default) | No import sites anywhere. |

### Duplicate data file
- `data/certificate-data.ts` and `data/certificate-data/certificate-data.ts` are **byte-for-byte identical** (confirmed via diff). Only the nested one (`data/certificate-data/certificate-data.ts`) is imported, by `app/certifications/page.tsx`. The flat one is a stale duplicate — delete it.

### Currently-unrendered but intentionally-kept branch
- `components/contact-me/**` + `utils/validation.ts` (only consumer) + `components/notification/notification-pop-up.tsx` (only consumer is `contact-me-section.tsx`) — all alive in the sense that they compile and are internally wired to each other, but nothing in `app/` currently imports the entry point (`ContactMeSection`). Per the in-code comment in `app/contact/page.tsx`, this is deliberate, not an oversight — but it means this is currently ~230 lines of dead weight (component tree + hook + validation constants + notification popup) sitting parallel to a second, independent contact-form implementation that *is* live (see next item). Decide: restore it, or delete it and consolidate on one form.

### Duplicated form logic (two independent EmailJS integrations)
- `components/bloom-panel/bloom-panel.tsx` (751 lines) — the live contact form on `/contact`, with its own inline validation, trimming, and a honeypot spam-guard, calling `emailjs.sendForm(...)` directly.
- `components/contact-me/contact-me-section.tsx` (117 lines) + `use-contact-form-validation.ts` + `utils/validation.ts` — the parked implementation, a *different* validation approach (regex constants + `ERROR_MESSAGES` map) calling the same `emailjs.sendForm(...)` API independently.

Two hand-rolled, non-shared validation/submission code paths for the same feature. If `ContactMeSection` really is coming back, its validation logic should be extracted so both consumers share it; if it isn't, delete the whole branch (previous bullet) rather than let two versions of "validate + send a contact form" drift further apart.

### Config/tooling dead weight
- `tailwind.config.js` — see STRUCTURE above; not loaded by the current Tailwind v4 pipeline at all.
- `styles/prisim.css` — see STRUCTURE above; unreferenced (even its would-be reference is commented out and misspelled differently).
- `.eslintignore` — ESLint 9's flat config no longer reads this file at all (prints `ESLintIgnoreWarning` on every run); its ignore patterns (`node_modules/`, `.next/`, etc.) are currently not applied via this file. Needs to move into an `ignores` block in `eslint.config.mjs`.
- devDependencies `eslint-plugin-prettier` and `eslint-config-prettier` are installed but never referenced in `eslint.config.mjs` — Prettier and ESLint currently run as two unrelated tools (which is fine), but these two packages exist to integrate them and aren't doing that job.

### Not dead, but worth flagging
- No `console.log`/`debugger` statements found anywhere in `app/`/`components/`/`data/`/`utils/`. The only `console.*` calls are two `console.error(error)` inside `catch` blocks (`bloom-panel.tsx:449`, `contact-me-section.tsx:43`) — reasonable defensive logging, not debug scaffolding, no action needed.
- No `TODO`/`FIXME`/`HACK` markers anywhere in the codebase — comments that do flag known issues (e.g. the horizontal-scroll rework note in `app/page.tsx`) are written as prose, not markers, so they won't show up in a `TODO` grep sweep later. Worth standardizing on a marker convention if the team wants those greppable.

---

## 3. NAMING

- **`components/button/botton.tsx`** — typo (should be `button.tsx`); also currently dead (see above).
- **`components/icon-components/mail-icon.tsx` vs. `gmail-icon.tsx`** — two icons for what reads as the same concept ("mail"), only one used. Rename/delete to remove the ambiguity for the next person who reaches for "the mail icon."
- **`data/certificate-data.ts` vs. `data/certificate-data/certificate-data.ts`** — identical name at two path depths, only one live. This is the kind of collision that causes real "which one do I edit" mistakes.
- **`git-icon.tsx`** exports `GitIcon` — ambiguous (GitHub icon? raw git logo?) and unused, so the ambiguity was never resolved by an actual call site either.
- **Quote-style inconsistency** suggests Prettier (`.prettierrc`: `singleQuote: true`) isn't being run uniformly — most files use double-quoted imports (`"@/components/..."`), but `components/contact-me/use-contact-form-validation.ts` uses single quotes throughout, matching the *configured* Prettier style rather than the *prevailing* in-repo style. Minor, but a signal that `npm run format` isn't part of the regular workflow (or was only run on some files).
- Everything else — component export names matching their file/folder (`SiteNav` in `site-nav/site-nav.tsx`, `DualCursor` in `cursor/dual-cursor.tsx`, etc.), consistent kebab-case for files/folders, consistent camelCase for functions/variables, consistent `use-x` naming for hooks — is clean and consistent. This is the strongest part of the codebase.

---

## 4. CORRECTNESS & BEST PRACTICES

*(Sanity/GROQ and Zustand subsections from the original brief: N/A — neither exists in this repo. No global client-state store of any kind is used; the one cross-cutting piece of state, the page-transition curtain, is handled via `components/page-transition/transition-context.tsx`, a plain React Context — a reasonable choice for a single boolean-ish transition flag, no store needed.)*

### Next.js App Router
- `app/layout.tsx` is correctly a server component; `"use client"` is scoped down to the 33 leaf files that actually need interactivity/hooks (confirmed by grep — no unnecessary top-level `"use client"` on layout or page shells beyond what animation/interaction requires).
- No `loading.tsx`/`error.tsx` boundaries anywhere under `app/`. Low risk in an all-client-rendered site with no data fetching that can fail mid-render, but if any future work adds async server data (or if the intermittent Google Fonts fetch failure mentioned in `HANDOFF.md` §1 is a sign the build environment is flaky), an `error.tsx` at the root would turn a blank white screen into a recoverable state.
- Two `dangerouslySetInnerHTML` calls in `app/layout.tsx` (inline background-color style + a scroll-restoration script) — both are **hardcoded static strings with no user input**, so this is safe, well-commented usage, not an XSS vector. Flagging only so it's not mistaken for a problem in a future security pass.
- `next.config.ts` is minimal and clean: `reactStrictMode: true` + a single permanent redirect (`/projects` → `/work`). No issues.

### ESLint is currently completely broken
Running `npm run lint` (or `npx eslint .`) throws immediately:
```
TypeError: Plugin "js" not found.
```
Root cause: `eslint.config.mjs` passes `plugins: [js, pluginReact, pluginReactHooks]` as an **array**, but then references `extends: ['js/recommended']` — for that string reference to resolve, `js` needs to be registered under the key `"js"` in a plugins **object** (`plugins: { js, react: pluginReact, 'react-hooks': pluginReactHooks }`), not just present in an array. `HANDOFF.md` §11 already notes this is "pre-existing, unrelated to this work" — confirmed still true, and it means **zero lint enforcement is currently running**, including `react-hooks/rules-of-hooks` (an error-level rule) and `typescript-eslint`'s recommended set. Given how much of this codebase is hook-heavy animation code (`useEffect`, custom hooks, `useReducedMotion`, `useScroll`/`useTransform`), this is worth fixing before doing a larger refactor — you want lint catching hook-order/dependency mistakes while files are being moved around, not after.

### React patterns
- No `any`/`as any` found anywhere in `.ts`/`.tsx` files — TypeScript strictness (`strict: true` in `tsconfig.json`) is actually being respected, not defeated with escape hatches. Good sign.
- No `@ts-ignore`/`@ts-nocheck` found.
- The reduced-motion handling is a deliberately engineered, SSR-safe pattern (`utils/use-reduced-motion.ts`, a hand-rolled `matchMedia` hook used in 9 files) specifically because Framer Motion's own `useReducedMotion` caused a real hydration mismatch (documented in `HANDOFF.md` §10). That said, `app/contact/page.tsx` and `app/about/page.tsx`/`app/page.tsx` import `useReducedMotion` **from `framer-motion` directly** (confirmed via grep — `framer-motion`'s hook shows up in `app/contact/page.tsx:4`, `app/page.tsx`, `app/about/page.tsx`, alongside the project's own SSR-safe hook being used elsewhere). If the hydration-mismatch bug was real and is still a live risk, having both the safe hook and the known-unsafe one in active use across different files is exactly the kind of inconsistency that reintroduces the bug in one place while it's fixed in another. Worth an explicit pass to standardize on one hook everywhere motion/structure depends on reduced-motion state.
- **Four animation/scroll libraries are active simultaneously**: GSAP + `@gsap/react` + ScrollTrigger (8 files), Framer Motion (14 files), Lenis (`smooth-scroll-provider.tsx`), and `smooothy` (`blog-marquee.tsx`, `pinned-track.tsx`). Each is a legitimate tool individually, but four overlapping animation engines in one small portfolio site is a real maintainability and bundle-size cost — every new scroll/motion feature now has to pick "which library handles this," and the home page's horizontal-scroll mechanism alone touches at least three of them (GSAP for other effects, Lenis for smooth-scroll, `smooothy` for the pinned track/marquee, Framer Motion for entrance animations). Worth an explicit decision on which library owns which category of animation before the refactor, rather than continuing to reach for whichever one a given past session happened to use.

### TypeScript
- Clean overall (see above — no `any`, no `@ts-ignore`, `strict: true` genuinely enforced).
- `tsconfig.tsbuildinfo` is tracked as untracked-but-present at repo root and is `.gitignore`d correctly — no issue, just confirming it isn't accidentally committed.

### Dependency hygiene
- **`clsx` is used in 16 files but is not declared anywhere in `package.json`** (neither `dependencies` nor `devDependencies`). It currently resolves only because some other direct dependency pulls it in transitively (present twice in `package-lock.json` as a nested `"clsx": "^2.0.0"` requirement, resolved to `2.1.1`). This works today but is fragile: if the package that happens to depend on `clsx` is ever removed or bumps past whatever pulls it in, `npm install` will silently stop providing `clsx` and every one of those 16 files breaks with "module not found," for a reason that won't be obvious from this repo's own `package.json` diff. Add it as a direct dependency.
- All other runtime dependencies in `package.json` (`@emailjs/browser`, `@gsap/react`, `@headlessui/react`, `@heroicons/react`, `@tailwindcss/typography`, `framer-motion`, `gsap`, `lenis`, `smooothy`) have at least one confirmed import site — none are unused.
- `eslint-plugin-prettier` / `eslint-config-prettier` — installed, not wired in (see DEAD CODE).

---

## 5. SECURITY / VULNERABILITIES

*(Supabase RLS/service-role-key, Razorpay signature/total-calculation, and Sanity subsections: N/A — this app has no database, no auth, no payment processing, and no CMS. There are also no API routes or Server Actions anywhere in `app/` — everything is client-rendered, and the only outbound network call from the app itself is the EmailJS contact-form submission, made directly from the browser.)*

### Secrets / client-bundle exposure
- `.env.local` contains three `NEXT_PUBLIC_*` values: `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`. All three are *meant* to be public — this is how EmailJS's client-side SDK is designed to work (the "public key" is an identifier, not a secret; EmailJS's own dashboard is where you'd configure allowed origins / domain restriction to stop it being called from elsewhere). This is not a leaked-secret finding. `.env*` is correctly gitignored.
- No service-role keys, API secrets, or anything server-only was found exposed to the client — because there is currently no server-only credential in this codebase at all.

### Contact form / spam surface (the one real user-input surface in the app)
- Because the contact form submits **directly from the browser to EmailJS's API** with no Next.js route/Server Action in between, all validation (`bloom-panel.tsx`'s inline checks, or the parked `use-contact-form-validation.ts` path) is client-side only. Anyone can read the public key/service ID/template ID out of the shipped JS bundle and call EmailJS's REST API directly, bypassing every validation rule and the honeypot field in this repo. This is an inherent trade-off of using EmailJS client-side (not a bug introduced by this codebase), and the standard mitigation — restricting allowed origins in the EmailJS account dashboard — lives outside this repo and can't be verified from the code. Worth a one-time check that origin restriction is actually turned on in the EmailJS account, since nothing in the repo enforces it.
- No rate limiting exists anywhere in the repo for this submission path — again, expected for a purely static/client app with no backend of its own; whatever throttling exists is whatever EmailJS's plan tier provides.

### `npm audit` — 4 high-severity advisories, all transitive
```
next            5 advisories (cache confusion / SSRF via rewrites / unbounded Server
                Action payload / SVG image-opt DoS / internal Server Function endpoint
                disclosure) — via node_modules/next
postcss <=8.5.22  XSS via unescaped </style> in stringify output; 3x sourcemap
                  path-traversal/arbitrary-file-read advisories — via node_modules/next/node_modules/postcss
sharp   <0.35.0   libvips CVEs (2026-33327/33328/35590/35591) — via node_modules/sharp
```
The installed Next.js version is **16.0.7**; latest is **16.3.3** — several patch releases behind, likely covering some/all of the advisories above. Given a Next.js security bump (30aa155) is already in recent commit history, this is worth another pass: run `npm audit fix` and bump `next` again, then re-check `npm audit`. None of these are catastrophic for a static portfolio with no auth/data layer (the SSRF-via-rewrites and Server-Function-disclosure ones matter far more for apps with server logic to disclose), but "high severity, fix available" sitting in a security-conscious repo (one that already did a CVE-driven upgrade once) is worth closing out.

### Headers / CSP
- No `headers()` config in `next.config.ts` — no CSP, `X-Frame-Options`, `Referrer-Policy`, etc. Standard for a lot of portfolio sites and not urgent, but cheap to add (`next.config.ts` → `headers()`) if you want a hardening pass while already in the config file for other reasons.

### CORS / CSRF
- Not applicable in the traditional sense — no API routes or Server Actions exist in this app for CSRF to target, and the only cross-origin call (to EmailJS) is intentional third-party API usage, not same-origin state-changing requests.

---

## 6. PRIORITIZATION

### Critical
| Item | Files |
|---|---|
| ESLint is completely non-functional (`Plugin "js" not found"`) — zero lint coverage, including `react-hooks/rules-of-hooks` — across a hook-heavy animation codebase mid-refactor | `eslint.config.mjs` |
| `next` is several versions behind current, with `npm audit` showing 5 Next.js advisories (SSRF via rewrites, unauthenticated Server Function endpoint disclosure, others) plus 4 high-severity transitive advisories (postcss, sharp) | `package.json`, `package-lock.json` |

### High
| Item | Files |
|---|---|
| `HANDOFF.md` describes an earlier version of Home/About/Contact that no longer matches the live code (e.g. it says Home is the carousel-style `HorizontalScroll` with dot indicators and Contact uses a "stacked word column + info dl + demoted form" layout; the actual current pages use `HorizontalScrollHome`/`PinnedTrack`/`BlogMarquee` and a `BloomPanel`-driven contact flow instead) — anyone (agent or human) using it as ground truth will make decisions against a stale model | `HANDOFF.md` vs. `app/page.tsx`, `app/contact/page.tsx`, `app/about/page.tsx` |
| Two independent, fully-built EmailJS contact-form implementations exist; only one is rendered | `components/bloom-panel/bloom-panel.tsx`, `components/contact-me/**`, `utils/validation.ts` |
| `clsx` used in 16 files but not declared in `package.json` — works only via an undeclared transitive dependency | `package.json` |
| Four overlapping animation/scroll libraries (GSAP+ScrollTrigger, Framer Motion, Lenis, smooothy) with no documented ownership boundary | `components/horizontal-scroll/*`, `components/blog-marquee/*`, `components/smooth-scroll/*`, various |
| `tailwind.config.js` silently unloaded by the current Tailwind v4 CSS-first setup (`@config` points elsewhere) | `tailwind.config.js`, `styles/tailwind.css` |
| Mixed usage of Framer Motion's `useReducedMotion` (previously documented as causing a real SSR hydration-mismatch bug) alongside the project's own SSR-safe `utils/use-reduced-motion.ts` hook, in different files | `app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` vs. `utils/use-reduced-motion.ts` consumers |
| 8 confirmed dead component files + 1 duplicate data file (see full list in §2) | `components/ghost-header/`, `availability-badge/`, `scroll-section/`, `grain/`, `page-under-construction/`, `button/botton.tsx`, `icon-components/mail-icon.tsx`, `icon-components/git-icon.tsx`, `data/certificate-data.ts` |

### Low
| Item | Files |
|---|---|
| `data/` nesting inconsistency (2 of 7 files wrapped in a same-name subfolder for no reason) | `data/blog-data/`, `data/certificate-data/` |
| `botton.tsx` filename typo | `components/button/botton.tsx` |
| `styles/prisim.css` misspelled + unreferenced (even its commented-out reference points to the correctly-spelled, nonexistent name) | `styles/prisim.css`, `styles/tailwind.css:2` |
| `.eslintignore` silently ignored by ESLint 9 flat config (warning printed every run) | `.eslintignore`, `eslint.config.mjs` |
| `eslint-plugin-prettier`/`eslint-config-prettier` installed but not wired into `eslint.config.mjs` | `package.json`, `eslint.config.mjs` |
| `README.md` is unedited `create-next-app` boilerplate (wrong font mentioned, no project-specific info) | `README.md` |
| No `headers()` / CSP config | `next.config.ts` |
| No `loading.tsx`/`error.tsx` boundaries under `app/` | `app/` |
| Inconsistent quote style (single vs. double) despite a configured Prettier style, suggesting `npm run format` isn't run consistently | repo-wide |
