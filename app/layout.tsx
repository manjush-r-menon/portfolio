import type { Metadata } from "next";
import { fraunces, inter } from "@/utils/fonts";
import { SiteNav } from "@/components/site-nav/site-nav";
import { SiteFooter } from "@/components/site-footer/site-footer";
import { PageSettle } from "@/components/page-transition/page-settle";
import { DualCursor } from "@/components/cursor/dual-cursor";
import { Preloader } from "@/components/preloader/preloader";
import { Providers } from "./providers";
import "@/styles/tailwind.css";

export const metadata: Metadata = {
  title: "Manjush | Portfolio",
  description: "Frontend Developer Portfolio of Manjush",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Paints before the compiled stylesheet or React can — avoids a
            white flash on first load. Must stay in sync with --ink in
            styles/tailwind.css since CSS custom properties aren't defined
            yet at this point. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html{background-color:#141412}`,
          }}
        />
        {/* Home maps vertical scroll to a horizontal panel offset
            (components/horizontal-scroll/pinned-track.tsx). Browsers
            restore the previous scroll position on reload by default,
            which here reads as the page jumping to the right on repeat
            refreshes. Runs synchronously, before the browser's own
            restoration, so it never gets a chance to apply. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual'}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <Preloader>
          <DualCursor />
          <Providers>
            <SiteNav />
            <main className="min-h-screen px-6 pt-28 pb-20 sm:px-10 sm:pt-36 sm:pb-16 lg:px-16 xl:px-24">
              <PageSettle>{children}</PageSettle>
            </main>
            <SiteFooter />
          </Providers>
        </Preloader>
      </body>
    </html>
  );
}
