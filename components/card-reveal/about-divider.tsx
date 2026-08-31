import clsx from "clsx";
import styles from "./card-reveal.module.css";

export function AboutDivider({
  sectionRef,
}: {
  sectionRef?: React.Ref<HTMLElement>;
}) {
  return (
    <section
      ref={sectionRef}
      className={clsx(styles.about, "-mx-6 sm:-mx-10 lg:-mx-16 xl:-mx-24")}
    >
      <h2 className="max-w-3xl text-center font-display text-[clamp(1.75rem,5vw,3.25rem)] leading-tight font-medium">
        Keep scrolling — it gets good
      </h2>
    </section>
  );
}
