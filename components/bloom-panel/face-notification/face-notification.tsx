"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import styles from "./face-notification.module.css";

/**
 * The "sending a message" character — a plain CSS face (no image assets):
 * a shadow blob, a circle face, two dot eyes, and a swappable mouth shape.
 * Ported from the face-character implementation spec, replacing the earlier
 * rocket/clouds illustration this panel used to show here.
 *
 * Controlled by the `outcome` prop, same shape as the illustration it
 * replaces: mounting this component IS "sending" (see bloom-panel.tsx,
 * which only renders it once a submit is in flight) — it starts neutral-
 * mouthed with the idle bounce running immediately. Flipping `outcome` to
 * "success" swaps in the happy mouth (bounce keeps running unchanged);
 * flipping to "failure" swaps in the sad mouth and switches the motion to
 * the roll/tumble loop. Either way, `onOutcomeComplete` fires ~400ms later
 * so the result text can wait for the expression to register first.
 */

export type FaceOutcome = "success" | "failure" | null;

const RESULT_REVEAL_DELAY_MS = 400;

type MouthKind = "neutral" | "happy" | "sad";

const MOUTH_CLASS: Record<MouthKind, string> = {
  neutral: styles.mouthNeutral,
  happy: styles.mouthHappy,
  sad: styles.mouthSad,
};

export function FaceNotification({
  outcome,
  onOutcomeComplete,
}: {
  outcome: FaceOutcome;
  onOutcomeComplete?: () => void;
}) {
  const reduced = useReducedMotion();

  const faceRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const onOutcomeCompleteRef = useRef(onOutcomeComplete);
  onOutcomeCompleteRef.current = onOutcomeComplete;

  const setMotion = (kind: "bounce" | "roll") => {
    const face = faceRef.current;
    const shadow = shadowRef.current;
    if (!face || !shadow) return;
    face.classList.remove(styles.animBounce, styles.animRoll);
    shadow.classList.remove(styles.animScale, styles.animMove);
    if (kind === "bounce") {
      face.classList.add(styles.animBounce);
      shadow.classList.add(styles.animScale);
    } else {
      face.classList.add(styles.animRoll);
      shadow.classList.add(styles.animMove);
    }
  };

  const setMouth = (kind: MouthKind) => {
    const mouth = mouthRef.current;
    if (!mouth) return;
    const applyShape = () => {
      mouth.className = `${styles.mouth} ${MOUTH_CLASS[kind]}`;
    };
    if (reduced) {
      applyShape();
      return;
    }
    // Instant className swaps read as a jump-cut — pop out, swap the
    // shape while invisible, pop back in with a slight overshoot.
    gsap.to(mouth, {
      scale: 0,
      duration: 0.1,
      ease: "power1.in",
      onComplete: () => {
        applyShape();
        gsap.fromTo(
          mouth,
          { scale: 0 },
          { scale: 1, duration: 0.22, ease: "back.out(2.2)" }
        );
      },
    });
  };

  // Stage open = "sending": neutral mouth, bounce motion, starting the
  // instant this component mounts (see bloom-panel.tsx's showIllustration).
  useEffect(() => {
    setMotion("bounce");
    const mouth = mouthRef.current;
    if (mouth) mouth.className = `${styles.mouth} ${styles.mouthNeutral}`;
  }, []);

  useEffect(() => {
    if (!outcome) return;

    if (outcome === "success") {
      setMouth("happy");
      // Motion stays bounce/scale — already running, don't restart it.
    } else {
      setMouth("sad");
      setMotion("roll");
    }

    const timer = setTimeout(
      () => onOutcomeCompleteRef.current?.(),
      reduced ? 0 : RESULT_REVEAL_DELAY_MS
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  return (
    <div className={styles.characterWrap}>
      <div ref={shadowRef} className={styles.shadow} />
      <div ref={faceRef} className={styles.face}>
        <div className={`${styles.eye} ${styles.eyeLeft}`} />
        <div className={`${styles.eye} ${styles.eyeRight}`} />
        <div
          ref={mouthRef}
          className={`${styles.mouth} ${styles.mouthNeutral}`}
        />
      </div>
    </div>
  );
}
