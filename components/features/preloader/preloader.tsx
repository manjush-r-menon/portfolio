"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markPreloaderDone } from "./preloader-ready";

const WORDS = [
  "Hello",
  "Bonjour",
  "Ciao",
  "नमस्ते",
  "നമസ്കാരം",
  "Hallå",
  "Guten tag",
  "Hallo",
];

const SESSION_KEY = "preloader-shown";

// Read (and immediately mark) the session flag once here, at module scope
// — not inside the effect below. React StrictMode's dev-only mount ->
// cleanup -> mount replay runs the component's effect body twice for one
// real page load; reading *and* writing sessionStorage inside that effect
// meant the first (StrictMode-only) invocation's write made the second
// invocation see "already shown" and skip the entire sequence, on every
// dev-mode load. Module top-level code only ever executes once per real
// page load (module evaluation isn't replayed by StrictMode), so deciding
// it here instead is immune to that replay. `typeof window` guards this
// against also running during SSR, where sessionStorage doesn't exist.
const alreadyShownThisSession =
  typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";
if (typeof window !== "undefined") {
  sessionStorage.setItem(SESSION_KEY, "1");
}

interface PreloaderProps {
  children: React.ReactNode;
}

export function Preloader({ children }: PreloaderProps) {
  const [showOverlay, setShowOverlay] = useState(true);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLParagraphElement>(null);
  const wordTextRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (alreadyShownThisSession || reduced) {
      setShowOverlay(false);
      markPreloaderDone();
      gsap.set(contentRef.current, { opacity: 1 });
      return;
    }

    document.body.style.overflow = "hidden";

    const dimension = { width: window.innerWidth, height: window.innerHeight };

    function getPaths() {
      const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;
      const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;
      return { initialPath, targetPath };
    }

    function setInitialPath() {
      const { initialPath } = getPaths();
      pathRef.current?.setAttribute("d", initialPath);
    }

    setInitialPath();

    function handleResize() {
      dimension.width = window.innerWidth;
      dimension.height = window.innerHeight;
      setInitialPath();
    }

    window.addEventListener("resize", handleResize);

    let index = 0;
    if (wordTextRef.current) wordTextRef.current.textContent = WORDS[index];

    gsap.to(wordRef.current, { opacity: 0.75, duration: 1, delay: 0.2 });

    // Kept as a mutable ref (not a plain local) so skip() below can kill
    // whichever word-cycle step is currently pending — cycleWords only
    // ever has one delayedCall in flight at a time, so overwriting this
    // on each step is enough to always be able to cancel the live one.
    let pendingCycleCall: gsap.core.Tween | null = null;

    function cycleWords() {
      if (index === WORDS.length - 1) return;
      const delay = index === 0 ? 1 : 0.15;
      pendingCycleCall = gsap.delayedCall(delay, () => {
        index += 1;
        if (wordTextRef.current) wordTextRef.current.textContent = WORDS[index];
        cycleWords();
      });
    }

    cycleWords();

    const totalDelay = WORDS.length * 0.15 + 1.5;

    // Extracted out of the delayedCall below so a skip gesture (see
    // skip()) can trigger the exact same reveal timeline on demand,
    // instead of only ever running once totalDelay naturally elapses.
    // Guarded so the timeline can never be built twice — a skip
    // triggered a tick before the natural delayedCall would otherwise
    // fire could race it.
    let revealed = false;
    function triggerReveal() {
      if (revealed) return;
      revealed = true;

      const { initialPath, targetPath } = getPaths();

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          setShowOverlay(false);
          document.body.style.overflow = "";
        },
      });

      tl.to(wordRef.current, { opacity: 0, duration: 0.3 }, 0);

      tl.to(
        preloaderRef.current,
        { y: "-100vh", duration: 0.8, delay: 0.2, ease: "power4.inOut" },
        0
      );

      tl.fromTo(
        pathRef.current,
        { attr: { d: initialPath } },
        {
          attr: { d: targetPath },
          duration: 0.7,
          delay: 0.3,
          ease: "power4.inOut",
        },
        0
      );

      // Starts while the curtain is still lifting (overlapping the tail of
      // the wipe above) so the page reads as coming to life underneath the
      // reveal, instead of popping in after the curtain has fully cleared.
      tl.fromTo(
        contentRef.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "transform",
        },
        "-=0.5"
      );

      // Fires at t=0.5 — the same absolute position the content fade
      // above starts at (NOT "-=0.5" relative, which after that fromTo
      // was appended would resolve against the timeline's new end and
      // land at t=0.8 instead). Gating hero text on the timeline's
      // onComplete (~1.3s) left a visible gap: the page itself was
      // already visible and settled while the hero text sat blank a beat
      // longer, reading as a lag right before the reveal.
      tl.call(() => markPreloaderDone(), [], 0.5);
    }

    const revealCall = gsap.delayedCall(totalDelay, triggerReveal);

    // Skip: a click/tap on the overlay, or any keypress, jumps straight to
    // the same reveal timeline above instead of waiting out totalDelay.
    // Only cancels the *waiting* — the curtain lift/wipe/content-fade
    // itself is untouched, so it plays identically to the default path,
    // just triggered early. Does nothing for anyone who never interacts:
    // the default timed sequence is unchanged.
    function skip() {
      pendingCycleCall?.kill();
      revealCall.kill();
      triggerReveal();
    }

    window.addEventListener("keydown", skip);
    preloaderRef.current?.addEventListener("click", skip);

    const wordEl = wordRef.current;
    const preloaderEl = preloaderRef.current;
    const pathEl = pathRef.current;
    const contentEl = contentRef.current;

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", skip);
      preloaderEl?.removeEventListener("click", skip);
      pendingCycleCall?.kill();
      revealCall.kill();
      gsap.killTweensOf([wordEl, preloaderEl, pathEl, contentEl]);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {showOverlay && (
        <div
          ref={preloaderRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
        >
          <p
            ref={wordRef}
            className="absolute z-[2] flex items-center text-[32px] leading-none opacity-0 md:text-[42px]"
          >
            <span className="mr-2.5 block h-2.5 w-2.5 flex-none rounded-full bg-accent" />
            <span ref={wordTextRef} className="text-bg" />
          </p>

          <svg
            className="absolute top-0 h-[calc(100%+300px)] w-full"
            preserveAspectRatio="none"
          >
            <path ref={pathRef} className="fill-ink" />
          </svg>
        </div>
      )}

      <div ref={contentRef} className="opacity-0">
        {children}
      </div>
    </>
  );
}
