import { TransitionLink } from "@/components/page-transition/transition-link";
import clsx from "clsx";

export function PillButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TransitionLink
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-full border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none",
        className
      )}
    >
      {children}
    </TransitionLink>
  );
}
