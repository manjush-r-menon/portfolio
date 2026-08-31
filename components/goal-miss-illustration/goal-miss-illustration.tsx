export function GoalMissIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 140"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      {/* Goal frame */}
      <path
        d="M30 20h140M30 20v80M170 20v80"
        stroke="var(--ink-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Ball — just gone in, top-right corner */}
      <circle cx="155" cy="34" r="5" stroke="var(--accent)" strokeWidth="1.5" />

      {/* Goalkeeper — diving toward the opposite (top-left) corner */}
      <circle
        cx="55"
        cy="55"
        r="7"
        stroke="var(--ink-dim)"
        strokeWidth="1.5"
      />
      <path
        d="M61 61 34 34M61 61 86 82M61 61 78 92"
        stroke="var(--ink-dim)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
