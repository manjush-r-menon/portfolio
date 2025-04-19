"use client";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../button/botton";
import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import ContactItem from "./contact-item";
import Input from "./contact-input";
import NotificationPopup from "../notification/notification-pop-up";

export default function ContactMeSection() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.current) return;

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(
        () => {
          setStatus({
            message: "Message sent successfully!",
            type: "success",
          });
          form.current?.reset();
        },
        (error) => {
          console.error(error);
          setStatus({
            message: "Failed to send the message. Try again later.",
            type: "error",
          });
        }
      );
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-16 grid-cols-1 lg:grid-cols-2">
      <div className="relative lg:static py-10 lg:pt-48">
        <div className="mx-auto max-w-4xl lg:mx-0">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Get in touch
          </h2>
          <p className="mt-6 text-lg/8 text-zinc-600 dark:text-zinc-400">
            Have a project in mind? Want to collaborate? Or just want to say
            hello? I'd love to hear from you!
          </p>
          <dl className="mt-10 space-y-4">
            <ContactItem icon={BuildingOffice2Icon} title="Address">
              Kochi, Kerala
              <br />
              India, 682301
            </ContactItem>
            <ContactItem icon={PhoneIcon} title="Telephone">
              <a
                href="tel:+919061267198"
                className="text-teal-500 dark:text-teal-400 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
              >
                +91 90612 67198
              </a>
            </ContactItem>
            <ContactItem icon={EnvelopeIcon} title="Email">
              <a
                href="mailto:manjushrmenon730@gmail.com"
                className="text-teal-500 dark:text-teal-400 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
              >
                manjushrmenon730@gmail.com
              </a>
            </ContactItem>
          </dl>
        </div>
      </div>

      <form ref={form} onSubmit={sendEmail} className="lg:pt-48">
        <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <Input
              id="first-name"
              name="first_name"
              label="First name"
              autoComplete="given-name"
            />
            <Input
              id="last-name"
              name="last_name"
              label="Last name"
              autoComplete="family-name"
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              className="sm:col-span-2"
            />
            <Input
              id="phone-number"
              name="phone"
              type="tel"
              label="Phone number"
              autoComplete="tel"
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm/6 font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Message
              </label>
              <div className="mt-2.5">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 dark:bg-zinc-800/90 dark:text-zinc-100 dark:outline-zinc-600 dark:placeholder:text-zinc-500 dark:focus:outline-teal-400"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button type="submit" variant="primary">
              Send message
            </Button>
          </div>
          {status && (
            <NotificationPopup
              message={status.message}
              type={status.type}
              onClose={() => setStatus(null)}
            />
          )}
        </div>
      </form>
    </div>
  );
}
