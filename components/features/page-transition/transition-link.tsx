"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTransitionCurtain } from "./transition-context";

type TransitionLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  onNavigate?: () => void;
};

export function TransitionLink({
  href,
  onClick,
  onNavigate,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { playTransition } = useTransitionCurtain();
  const targetHref = typeof href === "string" ? href : href.toString();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    onNavigate?.();
    if (targetHref === pathname) return;

    playTransition(targetHref, () => router.push(targetHref));
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
