import clsx from "clsx";

interface TagPillProps {
  children: React.ReactNode;
  className?: string;
}

export function TagPill({ children, className }: TagPillProps) {
  return (
    <span
      className={clsx(
        "rounded-full border border-line px-3 py-1 font-sans text-xs tracking-[0.02em] text-ink-dim",
        className
      )}
    >
      {children}
    </span>
  );
}
