import clsx from "clsx";

type GhostHeaderProps = {
  word: string;
  echo: string;
  as?: "h1" | "h2";
  className?: string;
};

export function GhostHeader({
  word,
  echo,
  as: Tag = "h1",
  className,
}: GhostHeaderProps) {
  return (
    <Tag className={clsx("flex flex-col", className)}>
      {word.split("\n").map((line, index) => (
        <span key={index} className="ghost-word-top">
          {line}
        </span>
      ))}
      <span className="ghost-word-echo">{echo}</span>
    </Tag>
  );
}
