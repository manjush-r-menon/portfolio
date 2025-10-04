import { Container } from "@/components/container/container";
import { projects } from "@/data/projects-data";

export default function Projects() {
  return (
    <Container className="flex h-full items-center pt-8 md:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Projects
            </h2>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
              Showcasing technical implementations and development expertise
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.title}
                className="group flex flex-col rounded-2xl p-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-zinc-800 transition-colors duration-300 dark:text-zinc-200 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    {project.role}
                  </p>
                </div>

                <p className="mt-4 text-zinc-600 transition-colors duration-300 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
