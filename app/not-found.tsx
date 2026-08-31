import { GoalMissIllustration } from "@/components/goal-miss-illustration/goal-miss-illustration";
import { PillButton } from "@/components/pill-button/pill-button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center text-center">
      <GoalMissIllustration className="h-32 w-auto sm:h-40" />

      <h1 className="mt-8 font-display text-3xl font-medium text-ink sm:text-4xl">
        Dove the wrong way on this one.
      </h1>
      <p className="mt-4 font-sans text-[15px] text-ink-dim">
        The page you&apos;re after isn&apos;t here — 404.
      </p>

      <PillButton href="/" className="mt-8">
        Back to safe ground →
      </PillButton>
    </div>
  );
}
