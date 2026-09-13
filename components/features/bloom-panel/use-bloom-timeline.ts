import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "@/components/features/smooth-scroll/smooth-scroll-provider";

// Sized generously enough that typical desktop/laptop viewports fit all
// form content without the internal scrollbar ever appearing (verified:
// ~625px of actual content vs. up to 660px available here — the reserved
// min-h-[1.5rem] error slots on each field, added for click reliability
// [see the layout-shift-during-click comment below], added ~72px of fixed
// height that the original 600px cap didn't account for) — scroll only
// kicks in as a fallback on genuinely short viewports where the height
// clamp below pushes the panel under that.
const PANEL_MAX_WIDTH = 480;
const PANEL_MAX_HEIGHT = 660;

interface UseBloomTimelineOptions {
  reduced: boolean;
  /** Focused the moment the panel opens — see the modal-behavior effect below. */
  initialFocusRef: RefObject<HTMLElement | null>;
}

/**
 * Owns the bloom-open/close lifecycle: the GSAP timeline itself, the
 * portal-mount gate, panel sizing, and everything that comes with treating
 * this as a real modal — scroll lock, hiding the rest of the page from
 * focus/AT/pointer input via `inert`, initial focus, a Tab trap, and
 * returning focus to the trigger on close. All open/close concerns live
 * here together since they're one lifecycle, not because they're the same
 * kind of code.
 */
export function useBloomTimeline({
  reduced,
  initialFocusRef,
}: UseBloomTimelineOptions) {
  const lenis = useLenis();
  const [isOpen, setIsOpen] = useState(false);
  const [panelSize, setPanelSize] = useState({
    width: PANEL_MAX_WIDTH,
    height: PANEL_MAX_HEIGHT,
  });
  // `typeof document !== "undefined"` alone isn't enough of a guard for a
  // portal: it's false during SSR but true from the client's very first
  // render, so createPortal would fire during hydration itself, and React
  // diffs that against the server's (portal-less) output as a genuine
  // mismatch. Needs to start false on *both* server and the client's first
  // pass, only flipping after a client-only effect — same shape as the
  // `inView` gate pinned-reveal.tsx uses around its own createPortal call.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // Mirrors `isOpen` for the useGSAP rebuild below, which can't put `isOpen`
  // itself in its dependency array without turning every open/close click
  // into a full timeline rebuild (see that dependency array's own comment).
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Clamped to the viewport so the panel never overflows small screens —
  // 48px margin top+bottom, 24px left+right, comfortable for a centered
  // modal. overflow-y-auto on the form content below is the actual safety
  // net regardless of this clamp being exactly right.
  // Recomputed on resize; see the useGSAP dependencies below — a resize
  // (including one triggered by opening/closing devtools, which resizes
  // the viewport just like dragging a window edge does) rebuilds the
  // timeline from scratch, paused at 0 (closed) by default. Without the
  // isOpenRef re-sync in that effect, a resize while open used to snap the
  // panel invisible while `isOpen`/the button's "Close" label stayed
  // unchanged — a real state/visual desync, not just a re-layout.
  useEffect(() => {
    const compute = () =>
      setPanelSize({
        width: Math.min(PANEL_MAX_WIDTH, window.innerWidth - 48),
        height: Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 96),
      });
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      // Reduced motion: no bloom/flip timeline at all, and deliberately
      // bail before touching `panel`'s inline style — visibility/size are
      // driven entirely by isOpen via plain conditional classes below (a
      // CSS opacity transition, already forced ~instant site-wide by the
      // prefers-reduced-motion rule in styles/tailwind.css). `sliderRef`
      // is also never attached in this mode (see the JSX below), which
      // would trip the null-check further down anyway — this explicit
      // early return just makes that non-obvious enough to state plainly.
      if (reduced) {
        tlRef.current = null;
        return;
      }

      const panel = panelRef.current;
      const slider = sliderRef.current;
      const formWrap = formWrapRef.current;
      const footer = footerRef.current;
      const fields = fieldRefs.current;
      if (!panel || !slider || !formWrap || !footer) return;

      // Width/height/opacity/borderRadius only — deliberately never x/y —
      // so the CSS `top-1/2 left-1/2 -translate-1/2` centering (set via
      // className, untouched by GSAP) keeps recalculating against the
      // panel's current size on every frame and it stays centered
      // throughout the grow, with no bleed/offset math needed.
      gsap.set(panel, {
        width: 64,
        height: 64,
        borderRadius: 9999,
        opacity: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
      });

      tl.to(panel, {
        width: panelSize.width,
        height: panelSize.height,
        borderRadius: 24,
        opacity: 1,
        duration: 0.75,
      });

      tl.to(slider, { yPercent: -50, duration: 0.5 }, 0);

      tl.set(panel, { pointerEvents: "none" }, 0);
      tl.set(panel, { pointerEvents: "auto" }, 0.01);

      tl.set(formWrap, { pointerEvents: "none" }, 0);
      tl.set(formWrap, { pointerEvents: "auto" }, 0.5);
      tl.fromTo(formWrap, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.2);

      tl.set(
        fields,
        {
          opacity: 0,
          rotateX: 90,
          y: 60,
          x: -16,
          transformPerspective: 300,
          transformOrigin: "bottom",
        },
        0
      );
      tl.to(
        fields,
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          x: 0,
          duration: 0.65,
          ease: "back.out(1.2)",
          stagger: 0.1,
        },
        0.45
      );

      tl.fromTo(
        footer,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.75
      );

      // If a resize (devtools open/close, window drag, orientation change)
      // rebuilt this timeline while the panel was actually open, the fresh
      // timeline above starts paused at its closed (t=0) state regardless —
      // jump it straight to fully-open instead of leaving `isOpen`/the
      // button label saying "open" while the panel itself renders hidden.
      if (isOpenRef.current) {
        tl.progress(1);
      }

      tlRef.current = tl;
    },
    {
      scope: panelRef,
      // `mounted` has to be here too: the portal (and therefore panelRef
      // etc.) doesn't exist in the DOM until `mounted` flips true (see its
      // declaration above), so the first run of this effect — during that
      // initial mount — no-ops on null refs. Without `mounted` in this
      // array, useGSAP never has a reason to run the callback again, and
      // the timeline permanently stays unbuilt.
      dependencies: [reduced, panelSize.width, panelSize.height, mounted],
    }
  );

  const toggle = contextSafe(() => {
    setIsOpen((open) => {
      const next = !open;
      if (!reduced) {
        if (next) tlRef.current?.play();
        else tlRef.current?.reverse();
      }
      return next;
    });
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Modal behavior while the panel is open: lock page scroll, hide the
  // rest of the page from focus/AT/pointer input, land focus in the form,
  // and hand focus back to the trigger on close (not document.body).
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    // Lenis drives scroll itself (see SmoothScrollProvider) and is never
    // instantiated under reduced motion or mobile-scroll widths — stop it
    // when present, and fall back to a plain CSS lock for the case where
    // it isn't (which is exactly when native scroll is what's actually
    // moving the page).
    lenis?.stop();
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Every other direct child of <body> — the app root, and any other
    // portal (e.g. PinnedReveal's) that happens to be mounted right now —
    // rather than anything hardcoded, so this stays correct regardless of
    // what else portals into body. `inert` pulls all of it out of the
    // focus order, the accessibility tree, and pointer/click handling.
    const siblings = Array.from(document.body.children).filter(
      (el) => el !== panel && el !== backdrop
    );
    siblings.forEach((el) => el.setAttribute("inert", ""));

    // Land focus in the form immediately rather than leaving it wherever
    // it was on the trigger button.
    initialFocusRef.current?.focus();

    // `inert` above shrinks the page's focus order down to just this
    // panel, but it doesn't make Tab *wrap* — reaching the panel's last
    // focusable element and pressing Tab would still exit the page to
    // browser chrome with nothing else on-page left to focus. This closes
    // that gap.
    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      siblings.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = previousBodyOverflow;
      lenis?.start();
      trigger?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    contextSafe,
    mounted,
    panelSize,
    triggerRef,
    panelRef,
    backdropRef,
    sliderRef,
    formWrapRef,
    fieldRefs,
    footerRef,
  };
}
