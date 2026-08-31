"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CONTACT_INFO } from "@/utils/contact-info";
import { useKochiTime } from "@/utils/use-kochi-time";
import { MagneticIcon } from "@/components/magnetic-icon/magnetic-icon";
import { BloomPanel } from "@/components/bloom-panel/bloom-panel";
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

const LINK_ROWS = [
  {
    label: "Github",
    href: `https://github.com/${CONTACT_INFO.github}`,
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/in/${CONTACT_INFO.linkedin}/`,
  },
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
      <div className="-mx-6 -mt-28 -mb-20 flex min-h-[calc(100vh-4.5rem)] flex-col border-b border-line pt-24 sm:-mx-10 sm:-mt-36 sm:-mb-16 lg:-mx-16 lg:flex-row xl:-mx-24">
      <h1 className="relative flex flex-1 flex-col justify-start overflow-hidden pb-10">
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

      <div className="relative flex w-full flex-col items-start justify-end gap-24 border-t border-line px-6 pb-10 sm:px-10 lg:w-[26rem] lg:gap-8 lg:border-t-0 lg:px-0 lg:pb-16">
        <div className="lg:hidden">{getInTouch}</div>

        {/* Divider line (desktop only, unchanged) plus the "Connect now"
            trigger — merged into one flex-1 self-stretch container so the
            button centers vertically in that same gap via plain flexbox
            (items-center/justify-center), with no JS measurement needed.
            Unconditional (not hidden on mobile) so there's exactly one
            rendered instance of BloomPanel — sharing its open/close state
            correctly — while still centering usefully in the equivalent
            mobile gap between "Get in touch" and the EMAIL/PHONE/BASED
            block. */}
        <div className="relative flex flex-1 items-center justify-center self-stretch">
          <div className="absolute inset-y-0 left-0 hidden w-px bg-line lg:block" />
          <BloomPanel />
        </div>

        <motion.div className="w-72 space-y-4 lg:-ml-36" {...fadeUp(0.25)}>
          <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1.5">
            {infoRows.map((row) => (
              <Fragment key={row.label}>
                <dt className="inline-flex items-center gap-1.5 font-sans text-xs tracking-[0.06em] text-ink-dim uppercase">
                  {row.label}
                </dt>
                <dd className="justify-self-end text-right font-sans text-sm text-ink">
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
              </Fragment>
            ))}
          </dl>
        </motion.div>

        <motion.div
          className="hidden items-center gap-2.5 lg:absolute lg:top-1/2 lg:right-6 lg:flex lg:-translate-y-1/2 lg:[writing-mode:vertical-rl]"
          {...fadeUp(0.35)}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4c9a5a]" />
          <span className="font-sans text-[11px] tracking-[0.08em] text-ink-dim uppercase">
            Available for work · 2026
          </span>
        </motion.div>
      </div>
      </div>

      <div className="flex min-h-[60vh] flex-col items-center justify-center">
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
