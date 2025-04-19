import {
  BriefcaseIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CpuChipIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";

export function CapabilitiesSection() {
  const capabilities = [
    {
      icon: CodeBracketIcon,
      title: "Full-Stack Development",
      description:
        "Building responsive web applications from frontend to backend using modern frameworks and tools.",
    },
    {
      icon: PaintBrushIcon,
      title: "UI/UX Design",
      description:
        "Creating intuitive user interfaces with attention to accessibility and user experience principles.",
    },
    {
      icon: PuzzlePieceIcon,
      title: "API Integration",
      description:
        "Connecting third-party services and building robust REST/GraphQL APIs.",
    },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Technical Capabilities
          </h2>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
            From pixels to endpoints - crafting complete digital experiences.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="group flex flex-col rounded-2xl p-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                  <capability.icon className="h-6 w-6 text-zinc-700 transition-colors duration-300 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-zinc-800 transition-colors duration-300 dark:text-zinc-200 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                  {capability.title}
                </h3>
                <p className="mt-2 text-zinc-600 transition-colors duration-300 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
