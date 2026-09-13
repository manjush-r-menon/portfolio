import type { Metadata } from "next";
import { Container } from "@/components/ui/container/container";
import { blogs } from "@/data/blogs";

const TITLE = "Blogs | Manjush Menon";
const DESCRIPTION = "Insights, tutorials, and stories from my development journey.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/blogs",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/twitter-image"],
  },
};

export default function Blogs() {
  return (
    <Container className="flex h-full items-center pt-8 md:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl">
              Blogs
            </h1>
            <p className="mt-6 text-lg text-zinc-600">
              Insights, tutorials, and stories from my development journey.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                key={blog.title}
                className="group flex flex-col rounded-2xl p-6 transition-all hover:bg-zinc-50"
              >
                {blog.icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                    <blog.icon className="h-6 w-6 text-zinc-700 group-hover:text-teal-500" />
                  </div>
                )}
                <h3 className="mt-4 text-xl font-semibold text-zinc-800 group-hover:text-teal-500">
                  {blog.title}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-zinc-600">
                    {blog.author}
                  </p>
                </div>
                <p className="mt-4 text-zinc-600 group-hover:text-teal-500">
                  {blog.description}
                </p>
                <a
                  href={blog.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-teal-600 hover:text-teal-500 font-medium"
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
