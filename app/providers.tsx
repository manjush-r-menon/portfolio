"use client";

import { TransitionProvider } from "@/components/page-transition/transition-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll/smooth-scroll-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <TransitionProvider>{children}</TransitionProvider>
    </SmoothScrollProvider>
  );
}
