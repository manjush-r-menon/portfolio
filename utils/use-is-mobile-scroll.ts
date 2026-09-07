"use client";

import { useEffect, useState } from "react";

export const MOBILE_SCROLL_BREAKPOINT = 1024;

export function useIsMobileScroll() {
  const [isMobileScroll, setIsMobileScroll] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      `(max-width: ${MOBILE_SCROLL_BREAKPOINT - 1}px)`,
    );
    setIsMobileScroll(query.matches);

    function onChange(event: MediaQueryListEvent) {
      setIsMobileScroll(event.matches);
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isMobileScroll;
}
