"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CONTACT_INFO } from "@/utils/contact-info";
import { useKochiTime } from "@/utils/use-kochi-time";
import { MagneticIcon } from "@/components/magnetic-icon/magnetic-icon";
import { BloomPanel } from "@/components/bloom-panel/bloom-panel";
import { ArrowIcon } from "@/components/icon-components/arrow-icon";
import { InstagramIcon } from "@/components/icon-components/instagram-icon";
import { LinkedInIcon } from "@/components/icon-components/linked-in-icon";
import { GmailIcon } from "@/components/icon-components/gmail-icon";
import { WhatsAppIcon } from "@/components/icon-components/whatsapp-icon";

// The email/phone contact form (components/contact-me/contact-me-section.tsx)
// is intentionally not rendered here right now — the page is being reworked
// to a single-screen hero. The component is untouched and ready to bring
// back once we decide where it belongs.

const WORDS = [
  { text: "REACH", indent: 0 },
  { text: "TALK", indent: 0.6 },
  { text: "BUILD", indent: 1.33 },
  { text: "CONNECT", indent: 0 },
] as const;

const INFO_ROWS = [
  {
    label: "Email",
    value: CONTACT_INFO.email.display,
    href: CONTACT_INFO.email.href,
  },
  {
    label: "Phone",
    value: CONTACT_INFO.phone.display,
    href: CONTACT_INFO.phone.href,
  },
  { label: "Based", value: CONTACT_INFO.based },
] as const;

// `boxed` wraps the icon in an explicit dark square (see the render below)
// instead of relying on the icon's own path for that look. LinkedIn is the
// only one left unboxed: its path already draws a square backdrop that
// fills its full box, so wrapping it again would just nest two squares.
// Instagram/WhatsApp draw their backdrop the same way LinkedIn does (one
// path, with the glyph as a cut-out hole that reveals whatever is behind
// it) — normally that's the page's cream background, but sitting on a
// *solid* box that trick would instead reveal the box's own dark fill,
// making the glyph vanish. Boxing them needs an explicit off-white color
// for the icon (see `text-bg` on the boxed span below) rather than
// currentColor inherited from the page.
const SOCIAL_ICON_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/manjush_r.menon?igsi=MWx1d2Fkc2VlcTRxeA%3D%3D&utm_source=qr",
    Icon: InstagramIcon,
    boxed: true,
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/in/${CONTACT_INFO.linkedin}/`,
    Icon: LinkedInIcon,
    boxed: false,
  },
  { label: "Email", href: CONTACT_INFO.email.href, Icon: GmailIcon, boxed: true },
  {
    label: "WhatsApp",
    // wa.me click-to-chat wants bare digits (country code + number, no
    // "+"), which is exactly what CONTACT_INFO.phone.href already has
    // after "tel:" — reused rather than duplicating the number.
    href: `https://wa.me/${CONTACT_INFO.phone.href.replace("tel:+", "")}`,
    Icon: WhatsAppIcon,
    boxed: true,
  },
] as const;

export default function Contact() {
  const reduced = useReducedMotion();
  const kochiTime = useKochiTime();
  const infoRows = INFO_ROWS.map((row) =>
    row.label === "Based" && kochiTime
      ? { ...row, value: `${row.value} — ${kochiTime}` }
      : row
  );
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.4,
      delay: reduced ? 0 : delay,
      ease: "easeOut" as const,
    },
  });

  const getInTouch = (
    <motion.div {...fadeUp(0.15)}>
      <p className="font-sans text-xs tracking-[0.08em] text-accent-ink uppercase">
        Get in touch
      </p>
      <p className="mt-4 font-sans text-[15px] leading-[1.7] text-ink-dim">
        Open to new projects,
        <br />
        collaborations &amp;
        <br />
        honest conversations.
      </p>
    </motion.div>
  );

  return (
    <>
      {/* `-mb-*` (cancelling <main>'s own reserved bottom padding — see
          app/layout.tsx's `pb-20 sm:pb-16`, there specifically so content
          never sits under the `fixed` SiteFooter bar) is desktop-only.
          Cancelling it used to be safe unconditionally because the "Or
          find me here" social-icon block always re-filled that reclaimed
          space — now that block is desktop-only (`lg:flex`, see below), so
          mobile needs to keep <main>'s real padding or its last visible
          content (the availability line) ends up hidden behind the fixed
          footer instead of just missing the padding. */}
      <div className="-mx-6 -mt-28 flex flex-col border-b border-line pt-24 sm:-mx-10 sm:-mt-36 lg:-mb-16 lg:min-h-[calc(100vh-4.5rem)] lg:-mx-16 lg:flex-row xl:-mx-24">
      {/* `flex-1`/full-viewport `min-h` are desktop-only (lg:) — they exist
          to make the two-column hero fill exactly one screen there. Mobile
          dropped "Get in touch" and now has noticeably less content (see
          the reference structure this matches), so forcing that same
          full-height on mobile would just relocate the leftover space into
          an oversized gap somewhere rather than actually shrinking the
          page — natural content height reads as the compact, snug flow
          the reference has. */}
      <h1 className="relative flex flex-col justify-start overflow-hidden pb-10 lg:flex-1">
        {WORDS.map((word, index) =>
          index === 1 ? (
            <div key={word.text} className="flex items-end gap-10">
              <motion.span
                className="ghost-word-hero"
                style={{ color: "#a8a496", marginLeft: `${word.indent}em` }}
                {...fadeUp(index * 0.06)}
              >
                {word.text}
              </motion.span>
              <div className="hidden lg:block">{getInTouch}</div>
            </div>
          ) : (
            <motion.span
              key={word.text}
              className="ghost-word-hero"
              style={{ color: "#a8a496", marginLeft: `${word.indent}em` }}
              {...fadeUp(index * 0.06)}
            >
              {word.text}
            </motion.span>
          )
        )}
      </h1>

      <div className="relative flex w-full flex-col items-start justify-end gap-8 border-t border-line px-6 pb-10 sm:px-10 lg:w-[26rem] lg:border-t-0 lg:px-0 lg:pb-16">
        {/* Divider line (desktop only, unchanged) plus the "Connect now"
            trigger — merged into one flex-1 self-stretch container so the
            button centers vertically in that same gap via plain flexbox
            (items-center/justify-center), with no JS measurement needed.
            Unconditional (not hidden on mobile) so there's exactly one
            rendered instance of BloomPanel — sharing its open/close state
            correctly. `order-2 lg:order-1` puts it after the email/phone/
            based block on mobile (matching the reference structure: words
            → divider → info → connect/socials → divider → availability)
            while keeping desktop's original visual order unchanged.
            `flex-1`/`self-stretch` are desktop-only now too — on mobile,
            with no forced full-viewport height above, there's no leftover
            space left for flex-grow to (mis)distribute into. */}
        <div className="relative order-2 flex flex-col items-center justify-center gap-6 lg:order-1 lg:flex-1 lg:self-stretch">
          <div className="absolute inset-y-0 left-0 hidden w-px bg-line lg:block" />
          <BloomPanel />

          {/* Compact text-link row, mobile only — the desktop big-icon
              "Or find me here" row further down (components/contact-me's
              75px icons) covers these same links there instead. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:hidden">
            {SOCIAL_ICON_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="inline-flex items-center gap-1 rounded-sm font-sans text-xs tracking-[0.08em] text-ink-dim uppercase transition-colors hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                {label}
                <ArrowIcon className="h-3 w-3 -rotate-45" />
              </a>
            ))}
          </div>
        </div>

        <motion.div
          className="order-1 w-full space-y-4 lg:order-2 lg:w-72 lg:-ml-36"
          {...fadeUp(0.25)}
        >
          {/* Mobile (the reference structure this matches): each row
              stacks label-then-value, both left-aligned — a plain flex
              column of per-row wrappers. `lg:contents` on each wrapper
              drops it from layout at desktop so dt/dd become direct grid
              items again, restoring the original side-by-side, right-
              aligned grid there unchanged. */}
          <dl className="flex flex-col gap-5 lg:grid lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-x-6 lg:gap-y-1.5">
            {infoRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 lg:contents">
                <dt className="inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.06em] text-ink-dim uppercase">
                  {row.label}
                </dt>
                <dd className="font-sans text-sm text-ink lg:justify-self-end lg:text-right">
                  {"href" in row && row.href ? (
                    <a
                      href={row.href}
                      target={
                        row.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        row.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="rounded-sm transition-colors hover:text-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="order-3 flex w-full items-center gap-2.5 border-t border-line pt-6 lg:w-auto lg:border-t-0 lg:pt-0 lg:absolute lg:top-1/2 lg:right-6 lg:-translate-y-1/2 lg:[writing-mode:vertical-rl]"
          {...fadeUp(0.35)}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4c9a5a]" />
          <span className="font-sans text-[11px] tracking-[0.08em] text-ink-dim uppercase">
            Available for work · 2026
          </span>
        </motion.div>
      </div>
      </div>

      {/* Big (75px) social icons read as a deliberate desktop flourish, not
          a primary contact path — email/phone/the Connect panel above
          already cover that on mobile — so this row is hidden below `lg`
          rather than shrunk down to fit. */}
      <div className="hidden min-h-[60vh] flex-col items-center justify-center lg:flex">
        <motion.p
          className="font-sans text-xs tracking-[0.08em] text-accent-ink uppercase"
          {...fadeUp(0.35)}
        >
          Or find me here
        </motion.p>
        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center"
          {...fadeUp(0.4)}
        >
          {SOCIAL_ICON_LINKS.map(({ label, href, Icon, boxed }) => (
            <MagneticIcon key={label}>
              <a
                href={href}
                aria-label={label}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="group inline-flex rounded-sm p-[50px] text-ink transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                {boxed ? (
                  <span className="flex h-[75px] w-[75px] items-center justify-center rounded-xl bg-ink text-bg transition-colors group-hover:bg-accent">
                    <Icon className="h-10 w-10" />
                  </span>
                ) : (
                  <Icon className="h-[75px] w-[75px]" />
                )}
              </a>
            </MagneticIcon>
          ))}
        </motion.div>
      </div>
    </>
  );
}
