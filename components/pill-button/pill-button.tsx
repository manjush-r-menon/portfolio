import { TransitionLink } from "@/components/page-transition/transition-link";
import clsx from "clsx";

const pillButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-ink px-6 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none";

type PillButtonProps = {
  children: React.ReactNode;
  className?: string;
} & (
  | { href: string; onClick?: undefined }
  | { href?: undefined; onClick: () => void }
);

export function PillButton({
  href,
  onClick,
  children,
  className,
}: PillButtonProps) {
  if (!href) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={clsx(pillButtonClassName, className)}
      >
        {children}
      </button>
    );
  }

  return (
    <TransitionLink href={href} className={clsx(pillButtonClassName, className)}>
      {children}
    </TransitionLink>
  );
}
