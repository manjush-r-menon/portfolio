"use client";

import { createContext, useContext } from "react";

export type TransitionContextValue = {
  playTransition: (href: string, navigate: () => void) => void;
};

export const TransitionContext = createContext<TransitionContextValue | null>(
  null
);

export function useTransitionCurtain() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error(
      "useTransitionCurtain must be used within TransitionProvider"
    );
  }
  return ctx;
}
