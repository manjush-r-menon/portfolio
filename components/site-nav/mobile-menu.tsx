"use client";

import clsx from "clsx";
import {
  Popover,
  PopoverButton,
  PopoverBackdrop,
  PopoverPanel,
} from "@headlessui/react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/utils/site-links";
import { TransitionLink } from "@/components/page-transition/transition-link";

export function MobileMenu({
  pathname,
  className,
}: {
  pathname: string;
  className?: string;
}) {
  return (
    <Popover className={className}>
      <PopoverButton
        aria-label="Open menu"
        className="flex items-center gap-2 font-sans text-sm tracking-[0.08em] text-ink-dim uppercase transition-colors hover:text-ink"
      >
        Menu
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="h-3 w-3 stroke-current stroke-[1.5] fill-none"
        >
          <path d="M2 5h12M2 11h12" strokeLinecap="round" />
        </svg>
      </PopoverButton>
      <PopoverBackdrop
        transition
        className="fixed inset-0 z-40 bg-ink/20 duration-150 data-closed:opacity-0"
      />
      <PopoverPanel
        focus
        transition
        className="fixed inset-x-4 top-6 z-40 origin-top rounded-none border border-line bg-bg p-8 shadow-xl duration-150 data-closed:scale-95 data-closed:opacity-0"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm tracking-[0.08em] text-ink-dim uppercase">
                Navigation
              </span>
              <PopoverButton
                aria-label="Close menu"
                className="text-ink-dim hover:text-ink"
              >
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="h-4 w-4 stroke-current stroke-[1.5]"
                >
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                </svg>
              </PopoverButton>
            </div>
            <nav className="mt-8">
              <ul className="divide-y divide-line font-display text-2xl">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <TransitionLink
                      href={link.href}
                      onNavigate={() => close()}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={clsx(
                        "block py-3",
                        pathname === link.href ? "text-ink" : "text-ink-dim"
                      )}
                    >
                      {link.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 flex gap-6 border-t border-line pt-6 font-sans text-sm text-ink-dim">
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
                  className="transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
