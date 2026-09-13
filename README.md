# Portfolio

Manjush Menon's personal portfolio — a Next.js site with a scroll-driven
home page, a 3D drag-and-zoom photo gallery, and a contact form wired to
EmailJS.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4**
- **GSAP** (ScrollTrigger, SplitText, CustomEase) — scroll-pinned sections,
  text reveals, and most looping/UI animation
- **Framer Motion** — a few spots GSAP doesn't cover as cleanly: shared-element
  (`layoutId`) transitions and `AnimatePresence` cross-fades, mainly in the
  gallery's control bar
- **Lenis** — smooth-scroll on standard page scroll
- **smooothy** — the horizontal-drag interaction on the home page's
  horizontal-scroll section
- **Three.js / React Three Fiber** — the `/gallery` route's 3D photo grid
- **EmailJS** — sends the contact form without a backend API route

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env.local`)

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Contact form (BloomPanel) email delivery |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Contact form email delivery |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Contact form email delivery |
| `BLOB_READ_WRITE_TOKEN` | Only needed to run the content scripts below (uploads to Vercel Blob) |

The site itself only needs the three `EMAILJS_*` vars to run — the Blob
token is only required if you're re-running the image-upload scripts.

## Content scripts

Images are hosted on Vercel Blob; the app reads their URLs from committed
JSON manifests (`data/gallery-manifest.json`,
`data/site-images-manifest.json`) rather than scanning a local folder. Two
one-off scripts populate those manifests:

```bash
npm run upload-gallery-images   # gallery-lab's 3D grid photos
npm run upload-site-images      # home page hero + gallery-wall photos
```

Both require `BLOB_READ_WRITE_TOKEN` in `.env.local` and are safe to re-run
(they overwrite existing Blob paths rather than duplicating them). Re-run
`upload-gallery-images` when adding/replacing gallery photos, and
`upload-site-images` when replacing the home page hero image or one of the
gallery-wall photos — in both cases only after the new source images are in
place locally (see each script's own header comment for exactly where they
read from).

## Other scripts

```bash
npm run build   # production build
npm run lint    # eslint
npm run format  # prettier --write
```
