import { Container } from "@/components/container/container";
import Image from "next/image";
import portraitImage from "@/images/about-page-image.jpeg";
import { InstagramIcon } from "@/components/icon-components/instagram-icon";
import { GitHubIcon } from "@/components/icon-components/git-icon";
import { LinkedInIcon } from "@/components/icon-components/linked-in-icon";
import MailIcon from "@/components/icon-components/mail-icon";
import Link from "next/link";
import clsx from "clsx";
import { CapabilitiesSection } from "@/components/capabilities-section/capabilities-section";
import { CapabilitiesSubsection } from "@/components/capabilities-section/capabilities-sub-sections";

interface SocialLinkProps {
  className?: string;
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: SocialLinkProps) {
  return (
    <li className={clsx(className, "flex")}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  );
}

export default function About() {
  return (
    <Container className="flex h-full items-center mt-16">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20 justify-items-center">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            Crafting beautiful front-end experiences from Kochi, Kerala.
          </h2>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            With a foundation in Computer Science Engineering and a passion for
            visual storytelling, I specialize in building modern, responsive,
            and intuitive web applications. My focus lies in creating digital
            experiences that not only function flawlessly but feel great to use.
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I’m currently expanding my skills in React.js while also diving
            deeper into frameworks like Angular and Next.js to broaden my
            front-end expertise. On the backend side, I'm strengthening my
            foundation in Java, aiming to become more versatile across the full
            stack. From clean UI layouts to interactive components, I strive to
            blend design sensibility with performance and accessibility.
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Off-screen, I draw a lot of inspiration from art and sports.
            Football is a big part of my life — whether it’s cheering for
            Argentina and FC Barcelona or reliving iconic moments from past
            matches. I also enjoy photography, sketching, and working on short
            film ideas whenever creativity strikes.
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Above all, I believe in staying curious and constantly evolving — as
            a developer, and as a storyteller. If you're into building cool
            stuff or just want to chat about Messi's magic on the pitch, hit me
            up!
          </p>
        </div>
        <div className="hidden md:block lg:pl-20">
          <ul role="list">
            <SocialLink
              href="https://www.instagram.com/manjush_r.menon/"
              icon={InstagramIcon}
              className="mt-4"
            >
              Follow on Instagram
            </SocialLink>
            <SocialLink
              href="https://github.com/manjush-r-menon"
              icon={GitHubIcon}
              className="mt-4"
            >
              Follow on GitHub
            </SocialLink>
            <SocialLink
              href="https://www.linkedin.com/in/manjush-menon/"
              icon={LinkedInIcon}
              className="mt-4"
            >
              Follow on LinkedIn
            </SocialLink>
            <SocialLink
              href="mailto:spencer@planetaria.tech"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              manjushrmenon730@gmail.com
            </SocialLink>
          </ul>
        </div>
      </div>
      <CapabilitiesSection />
      <CapabilitiesSubsection />
    </Container>
  );
}
