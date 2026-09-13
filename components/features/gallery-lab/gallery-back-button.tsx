"use client";

import { useRouter } from "next/navigation";
import { useTransitionCurtain } from "@/components/features/page-transition/transition-context";
import { ArrowIcon } from "@/components/ui/icon-components/arrow-icon";

/**
 * Exits the gallery back to wherever the visitor came from (the About page's
 * tagline hover, the only in-app link to this experimental, noindex route
 * today). Uses router.back() rather than a fixed TransitionLink target since
 * there's no single "correct" destination to hardcode — still routed through
 * the site's own wipe-curtain transition (see playTransition) so it doesn't
 * feel like a jarring native back nav next to every other link on the site.
 *
 * Positioned top-left, below the fixed site header (measured 76-88px tall
 * depending on breakpoint — 104px clears both with room to spare) rather
 * than bottom-left: bottom-left is where Next.js's own dev-tools indicator
 * sits in development, and would fight this button for clicks there (a
 * dev-only conflict, but not worth colliding with). Reuses the minimap's
 * dark/blurred chrome for visual consistency with the gallery's other
 * floating controls. Unlike the minimap this is always visible, not just
 * while interacting — it's the page's only way out of a full-screen canvas
 * that otherwise swallows the whole viewport, so it can't be conditionally
 * hidden the way the minimap's "only show while dragging/focused" chrome
 * can.
 */
export function GalleryBackButton() {
  const router = useRouter();
  const { playTransition } = useTransitionCurtain();

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => playTransition("", () => router.back())}
      style={{
        position: "fixed",
        top: 104,
        left: "2vw",
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "color-mix(in srgb, var(--ink) 40%, transparent)",
        backdropFilter: "blur(10px)",
        border: "1px solid color-mix(in srgb, var(--bg) 20%, transparent)",
        color: "var(--bg)",
        cursor: "pointer",
      }}
    >
      <ArrowIcon className="h-4 w-4 rotate-180" />
    </button>
  );
}
