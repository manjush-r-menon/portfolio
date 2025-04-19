export function CapabilitiesSubsection() {
  const skills = {
    frontend: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Redux",
      "Angular",
      "Vue.js",
    ],
    backend: ["java", "PostgreSQL", "SQL", "GraphQL", "Python"],
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <h3 className="text-center text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
        Technical Expertise
      </h3>

      <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h4 className="text-center text-xl font-semibold text-zinc-600 dark:text-zinc-400">
            Frontend Development
          </h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {skills.frontend.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-4xl bg-zinc-50 px-8 py-2 text-sm font-medium text-zinc-700 transition-all 
                           duration-300 hover:text-teal-500 hover:bg-zinc-100 dark:bg-zinc-800/50 md:dark:bg-zinc-900/50 md:dark:hover:bg-zinc-800/50 dark:text-zinc-300 dark:hover:text-teal-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="text-center text-xl font-semibold text-zinc-600 dark:text-zinc-400">
            Backend Development
          </h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {skills.backend.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-4xl bg-zinc-50 px-8 py-2 text-sm font-medium text-zinc-700 transition-all 
                           duration-300 hover:bg-zinc-100 hover:text-teal-500 dark:bg-zinc-800/50 md:dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 dark:text-zinc-300 dark:hover:text-teal-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
