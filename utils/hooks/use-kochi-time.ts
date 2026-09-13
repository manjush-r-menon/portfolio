"use client";

import { useEffect, useState } from "react";

const UPDATE_INTERVAL_MS = 30_000;

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * Starts `null` on both server and first client paint (SSR-safe, same
 * mount-gated pattern as `use-reduced-motion.ts`), then resolves to a
 * live Kochi-local time string after mount.
 */
export function useKochiTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(formatter.format(new Date()));
    update();
    const id = window.setInterval(update, UPDATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return time;
}
