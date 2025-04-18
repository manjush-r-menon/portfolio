import { Container } from "@/components/container/container";
import { GitHubIcon } from "@/components/icon-components/git-icon";
import { InstagramIcon } from "@/components/icon-components/instagram-icon";
import { LinkedInIcon } from "@/components/icon-components/linked-in-icon";
import { SocialLink } from "@/components/social-link/social-link";

export default function Home() {
  return (
    <Container className="flex h-full items-center mt-10">
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
          <SocialLink href="#" icon={InstagramIcon} />
          <SocialLink href="#" icon={GitHubIcon} />
          <SocialLink href="#" icon={LinkedInIcon} />
        </div>
      </div>
    </Container>
  );
}
