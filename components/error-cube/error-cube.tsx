"use client";

import { Fragment, useEffect, useRef } from "react";
import styles from "./error-cube.module.css";

export type MarqueeSegment = {
  pre: string;
  highlight: string;
  post: string;
};

const REPEAT_COUNT = 3;

function MarqueeText({ phrases }: { phrases: MarqueeSegment[] }) {
  const segments = Array.from({ length: REPEAT_COUNT }, () => phrases).flat();

  return (
    <p>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {segment.pre} <span className={styles.highlight}>{segment.highlight}</span>{" "}
          {segment.post}{" "}
        </Fragment>
      ))}
    </p>
  );
}

function CubeFaces({ phrases }: { phrases: MarqueeSegment[] }) {
  return (
    <div className={styles.cube}>
      <div className={`${styles.face} ${styles.top}`} />
      <div className={`${styles.face} ${styles.bottom}`} />
      <div className={`${styles.face} ${styles.left} ${styles.text}`}>
        <MarqueeText phrases={phrases} />
      </div>
      <div className={`${styles.face} ${styles.right} ${styles.text}`}>
        <MarqueeText phrases={phrases} />
      </div>
      <div className={`${styles.face} ${styles.front}`} />
      <div className={`${styles.face} ${styles.back} ${styles.text}`}>
        <MarqueeText phrases={phrases} />
      </div>
    </div>
  );
}

export function ErrorCube({ phrases }: { phrases: MarqueeSegment[] }) {
  const cubeStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function adjustContentSize() {
      const cubeStageEl = cubeStageRef.current;
      if (!cubeStageEl) return;
      const baseWidth = 1000;
      const viewportWidth = window.innerWidth;
      const scaleFactor =
        viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.8 : 1;
      cubeStageEl.style.transform = `scale(${scaleFactor})`;
    }

    adjustContentSize();
    window.addEventListener("resize", adjustContentSize);
    return () => window.removeEventListener("resize", adjustContentSize);
  }, []);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.content}>
        <div className={styles.containerFull}>
          <div className={`${styles.hue} ${styles.animated}`} />
          <div ref={cubeStageRef} className={styles.container}>
            <CubeFaces phrases={phrases} />
            <div className={styles.containerReflect}>
              <CubeFaces phrases={phrases} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
