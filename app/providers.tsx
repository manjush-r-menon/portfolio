"use client";

import { TransitionProvider } from "@/components/features/page-transition/transition-provider";
import { SmoothScrollProvider } from "@/components/features/smooth-scroll/smooth-scroll-provider";
import { ScrollTriggerRefresh } from "@/components/features/smooth-scroll/scroll-trigger-refresh";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SmoothScrollProvider>
      <ScrollTriggerRefresh />
      <TransitionProvider>{children}</TransitionProvider>
    </SmoothScrollProvider>
  );
}
