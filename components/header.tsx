"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { DesktopNavigation } from "./navigation/desktop-nav/desktop-navigation";
import { MobileNavigation } from "./navigation/mobile-nav/mobile-navigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  let isHomePage = usePathname() === "/";

  let headerRef = useRef<React.ElementRef<"div">>(null);

  return (
    <>
      <header
        className="pointer-events-none relative z-50 flex flex-none flex-col"
        style={{
          height: "var(--header-height)",
          marginBottom: "var(--header-mb)",
        }}
      >
        <div
          ref={headerRef}
          className="top-0 z-10 h-16 pt-6"
          style={{
            position:
              "var(--header-position)" as React.CSSProperties["position"],
          }}
        >
          <Container
            className="top-(--header-top,--spacing(6)) w-full"
            style={{
              position:
                "var(--header-inner-position)" as React.CSSProperties["position"],
            }}
          >
            <div className="relative flex gap-4">
              <div className="flex flex-1">
                <span className="px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  <span className="block md:hidden">MRM</span>
                  <span className="hidden md:block">Manjush R Menon</span>
                </span>
              </div>
              <div className="flex flex-1 justify-end md:justify-center">
                <MobileNavigation className="pointer-events-auto md:hidden" />
                <DesktopNavigation className="pointer-events-auto hidden md:block" />
              </div>
              <div className="flex justify-end md:flex-1">
                <div className="pointer-events-auto">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>
      {isHomePage && (
        <div
          className="flex-none"
          style={{ height: "var(--content-offset)" }}
        />
      )}
    </>
  );
}
