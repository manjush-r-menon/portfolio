import clsx from "clsx";

export function IndexLabel({
  index,
  large,
  className,
}: {
  index: string;
  /** Bigger, bolder treatment for use as a standalone visual moment. */
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "block font-sans tracking-[0.06em]",
        large
          ? "grotesk-display text-[clamp(2.5rem,6vw,4.5rem)] text-ink"
          : "text-[13px] text-ink-dim",
        className
      )}
    >
      {index}/
    </span>
  );
}
