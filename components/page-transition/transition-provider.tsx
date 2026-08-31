"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { TransitionContext } from "./transition-context";
import { PAGE_NAMES } from "@/utils/site-links";

const STROKE_WIDTH_REST = 200;
const STROKE_WIDTH_COVER = 700;

// Two decorative squiggle paths, ported from the reference 1:1 (only the
// stroke colors were changed). They mean nothing structurally — swap them
// for different path data if the shape itself needs to change later.
const PATH_1 =
  "M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262";
const PATH_2 =
  "M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012";

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const lengthsRef = useRef<number[]>([0, 0]);
  const [announcement, setAnnouncement] = useState("");
  const reduced = useReducedMotion();

  // getTotalLength() needs the path actually laid out in the DOM, so this
  // can only run client-side, after mount.
  useEffect(() => {
    [path1Ref.current, path2Ref.current].forEach((path, i) => {
      if (!path) return;
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      lengthsRef.current[i] = length;
    });
  }, []);

  const playTransition = useCallback(
    (href: string, navigate: () => void) => {
      setAnnouncement(PAGE_NAMES[href] ?? "");

      const paths = [path1Ref.current, path2Ref.current].filter(
        (p): p is SVGPathElement => p !== null
      );

      if (reduced || paths.length === 0) {
        navigate();
        return;
      }

      const lengths = lengthsRef.current;

      const leave = gsap.timeline({
        onComplete: () => {
          navigate();

          const enter = gsap.timeline();
          paths.forEach((path, i) => {
            enter.to(
              path,
              {
                strokeDashoffset: -lengths[i],
                attr: { "stroke-width": STROKE_WIDTH_REST },
                duration: 1,
                ease: "power1.inOut",
                onComplete: () => {
                  gsap.set(path, { strokeDashoffset: lengths[i] });
                },
              },
              0
            );
          });
        },
      });

      paths.forEach((path) => {
        leave.to(
          path,
          {
            strokeDashoffset: 0,
            attr: { "stroke-width": STROKE_WIDTH_COVER },
            duration: 1,
            ease: "power1.inOut",
          },
          0
        );
      });
    },
    [reduced]
  );

  const value = { playTransition };

  return (
    <TransitionContext.Provider value={value}>
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 left-1/2 z-[110] h-full w-full -translate-x-1/2 -translate-y-1/2 scale-150"
      >
        <svg
          viewBox="0 0 2453 2535"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            ref={path1Ref}
            className="page-transition-path stroke-bg"
            d={PATH_1}
            strokeWidth={STROKE_WIDTH_REST}
            strokeLinecap="round"
          />
          <path
            ref={path2Ref}
            className="page-transition-path stroke-accent"
            d={PATH_2}
            strokeWidth={STROKE_WIDTH_REST}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </TransitionContext.Provider>
  );
}
