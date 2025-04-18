import Link from "next/link";
import clsx from "clsx";

const AboutMeSection = () => {
  return (
    <div className="flex flex-col mt-12">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
        About
      </h2>
      <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
        I’m a front-end developer with a Computer Science Engineering
        background, based in Kochi. I’m passionate about building accessible,
        performant, and user-friendly web experiences. Currently diving deeper
        into React.js, exploring the power of Webflow, and sharpening my design
        instincts along the way. I enjoy solving real-world problems through
        code and always stay curious.
      </p>
      <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
        When I’m not coding, you’ll probably find me watching football (always
        rooting for Argentina and FC Barcelona 🔵🔴), capturing moments through
        photography, sketching ideas, or experimenting with short film concepts.
        I'm constantly learning — striving to grow both as a developer and a
        creative.{" "}
        <Link
          href="/about"
          className={clsx(
            "transition text-teal-500 dark:text-teal-400 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          More about me
        </Link>
      </p>
    </div>
  );
};

export default AboutMeSection;
