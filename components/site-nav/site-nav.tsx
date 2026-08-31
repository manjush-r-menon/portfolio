"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV_LINKS, SOCIAL_LINKS } from "@/utils/site-links";
import { MobileMenu } from "./mobile-menu";
import { TransitionLink } from "@/components/page-transition/transition-link";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-bg px-6 py-5 sm:px-10 sm:py-[26px]">
      <div className="grid grid-cols-2 items-center gap-4 md:grid-cols-3">
        <TransitionLink
          href="/"
          className="group inline-flex items-baseline font-display text-3xl font-medium text-ink"
        >
          Manjush
          <span className="ml-1 inline-block max-w-0 overflow-hidden whitespace-nowrap text-ink-dim opacity-0 transition-[max-width,opacity] duration-[220ms] ease-out group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
            R Menon
          </span>
        </TransitionLink>

        <nav
          aria-label="Primary"
          className="hidden justify-self-center font-sans text-2xl md:block"
        >
          {NAV_LINKS.map((link, index) => (
            <span key={link.href}>
              <TransitionLink
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={clsx(
                  "rounded-sm transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  pathname === link.href
                    ? "font-medium text-ink"
                    : "text-ink-dim"
                )}
              >
                {link.label}
              </TransitionLink>
              {index < NAV_LINKS.length - 1 && (
                <span className="text-ink-dim">, </span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex justify-self-end">
          <div className="hidden items-center gap-6 font-sans text-2xl text-ink-dim md:flex">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="rounded-sm transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                {link.label}
              </a>
            ))}
          </div>
          <MobileMenu pathname={pathname} className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
