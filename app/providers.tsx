"use client";

import { TransitionProvider } from "@/components/page-transition/transition-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll/smooth-scroll-provider";
import { ScrollTriggerRefresh } from "@/components/smooth-scroll/scroll-trigger-refresh";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <ScrollTriggerRefresh />
      <TransitionProvider>{children}</TransitionProvider>
    </SmoothScrollProvider>
  );
}
