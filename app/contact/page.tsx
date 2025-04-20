import ContactMeSection from "@/components/contact-me/contact-me-section";
import { Container } from "@/components/container/container";
import Image from "next/image";
import portraitImage from "@/images/contact-section-image.png";

export default function Contact() {
  return (
    <Container className="flex h-full items-center mt-8 md:mt-16">
      <div className="flex items-center justify-center">
        <div className="w-48 sm:w-80 px-2.5">
          <Image
            src={portraitImage}
            alt="Portrait of Manjush"
            sizes="(min-width: 1024px) 16rem, 12rem"
            className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
          />
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Whether you're looking to collaborate on a project, have questions
          about my work, or just want to connect - I'm always open to new
          opportunities and conversations. Feel free to reach out through the
          form below, or directly via email at{" "}
          <span className="font-medium text-teal-500 dark:text-teal-400">
            manjushrmenon730@gmail.com
          </span>
          . I make it a point to respond to all messages within 24 hours.
        </p>
      </div>
      <ContactMeSection />
    </Container>
  );
}
