import { Container } from "@/components/container/container";
import { blogs } from "@/data/blog-data/blog-data";

export default function Blogs() {
  return (
    <Container className="flex h-full items-center pt-8 md:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              Blogs
            </h2>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
              Insights, tutorials, and stories from my development journey.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog.title}
                className="group flex flex-col rounded-2xl p-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                {blog.icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
                    <blog.icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
                  </div>
                )}
                <h3 className="mt-4 text-xl font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                  {blog.title}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {blog.author}
                  </p>
                </div>
                <p className="mt-4 text-zinc-600 dark:text-zinc-400 group-hover:text-teal-500 dark:group-hover:text-teal-400">
                  {blog.description}
                </p>
                <a
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
                >
                  Read more
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
