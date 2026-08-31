"use client";

import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import Input from "./contact-input";
import Textarea from "./contact-textarea";
import NotificationPopup from "../notification/notification-pop-up";
import { useContactFormValidation } from "./use-contact-form-validation";

export default function ContactMeSection() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { errors, validateInput, clearErrors } =
    useContactFormValidation(form);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.current) return;

    if (validateInput()) {
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
            clearErrors();
          },
          (error) => {
            console.error(error);
            setStatus({
              message: "Failed to send the message. Try again later.",
              type: "error",
            });
          }
        );
    }
  };

  return (
    <form ref={form} onSubmit={sendEmail} noValidate className="max-w-xl">
      <p className="font-sans text-xs tracking-[0.08em] text-ink-dim uppercase">
        Or send a message directly
      </p>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <Input
          id="first-name"
          name="first_name"
          label="First name"
          autoComplete="given-name"
          error={errors.firstName}
        />
        <Input
          id="last-name"
          name="last_name"
          label="Last name"
          autoComplete="family-name"
          error={errors.lastName}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          className="sm:col-span-2"
          error={errors.email}
        />
        <Input
          id="phone-number"
          name="phone"
          type="tel"
          label="Phone number"
          autoComplete="tel"
          className="sm:col-span-2"
          error={errors.phone}
        />
        <Textarea
          id="message"
          name="message"
          label="Message"
          rows={4}
          className="sm:col-span-2"
          error={errors.message}
        />
      </div>
      <div className="mt-6 flex justify-start">
        <button
          type="submit"
          className="border-b border-ink font-sans text-xs tracking-[0.08em] text-ink uppercase transition-colors hover:border-accent hover:text-accent-ink"
        >
          Send message
        </button>
      </div>
      {status && (
        <NotificationPopup
          message={status.message}
          type={status.type}
          onClose={() => setStatus(null)}
        />
      )}
    </form>
  );
}
