export default function ContactItem({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-x-4">
      <dt className="flex-none">
        <span className="sr-only">{title}</span>
        <Icon className="h-7 w-6 text-zinc-400 dark:text-zinc-500" />
      </dt>
      <dd className="text-base text-zinc-600 dark:text-zinc-400">{children}</dd>
    </div>
  );
}
