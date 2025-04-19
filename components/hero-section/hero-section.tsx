import { GitHubIcon } from "../icon-components/git-icon";
import { InstagramIcon } from "../icon-components/instagram-icon";
import { LinkedInIcon } from "../icon-components/linked-in-icon";
import { SocialLink } from "../social-link/social-link";
import Image from "next/image";
import image from "@/images/hero-section-image.png";

const HeroSection = () => {
  return (
    <div className="flex flex-row gap-6 md:gap-12 mt-2 mb-8 md:mt-8 mb:mt-8 lg:mt-20 lg:mb-40">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Software Developer, Tech Enthusiast, and Lifelong Learner.
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          Hi, I’m Manjush — a frontend developer from India. I work with modern
          web technologies like React and TypeScript to build fast, accessible,
          and user-friendly applications. When I’m not coding, I’m probably
          geeking out over football or exploring the latest in web dev.
        </p>
        <div className="mt-6 flex gap-6">
          <SocialLink
            href="https://www.instagram.com/manjush_r.menon/"
            icon={InstagramIcon}
          />
          <SocialLink
            href="https://github.com/manjush-r-menon"
            icon={GitHubIcon}
          />
          <SocialLink
            href="https://www.linkedin.com/in/manjush-menon/"
            icon={LinkedInIcon}
          />
        </div>
      </div>
      <div
        key={image.src}
        className={
          "relative aspect-9/10 w-44 hidden sm:block flex-none overflow-hidden rounded-xl rotate-2 bg-zinc-100 sm:w-72 sm:rounded-2xl dark:bg-zinc-800"
        }
      >
        <Image
          src={image}
          alt=""
          sizes="(min-width: 640px) 18rem, 11rem"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default HeroSection;
