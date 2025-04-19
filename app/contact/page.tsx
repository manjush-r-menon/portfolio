import ContactMeSection from "@/components/contact-me/contact-me-section";
import { Container } from "@/components/container/container";

export default function Contact() {
  return (
    <Container className="flex h-full items-center">
      <div className="mt-24 text-center">
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
