import { useEffect, useRef, useState, type RefObject } from "react";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { validate, validateEmail, validateMessage, validateName } from "./validation";
import type { FormErrors } from "./validation";

// Deliberate minimum time the sending state stays on screen, so a fast
// network response never reads as a flicker — see handleSubmit below.
const SENDING_MIN_DISPLAY_MS = 900;

// No human fills a 3-field form and submits faster than this.
const MIN_HUMAN_SUBMIT_MS = 2000;

const SUCCESS_MESSAGE = "Message sent — thanks, I'll get back to you soon.";

function waitForMinDisplay(startedAt: number, minMs: number) {
  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, minMs - elapsed);
  return new Promise((resolve) => setTimeout(resolve, remaining));
}

interface UseContactSubmitOptions {
  isOpen: boolean;
  reduced: boolean;
  /** Focused when a submit fails validation on this field — see handleSubmit. */
  nameInputRef: RefObject<HTMLInputElement | null>;
  contextSafe: ReturnType<typeof useGSAP>["contextSafe"];
}

/**
 * Owns the form itself: field state/validation, the spam guards, and the
 * EmailJS submit flow. Everything here is about what happens *inside* the
 * panel while it's open — the open/close lifecycle itself lives in
 * useBloomTimeline.
 */
export function useContactSubmit({
  isOpen,
  reduced,
  nameInputRef,
  contextSafe,
}: UseContactSubmitOptions) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  // Timestamp the panel was last opened — the "no human is this fast"
  // trap below measures from here, not from component mount (the trigger
  // button, and therefore this component, is mounted the whole time the
  // Contact page is open).
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
    } else {
      // Closing: clear the last submit's status/validation state so it
      // doesn't linger and reappear stale the next time the panel opens.
      setStatus(null);
      setErrors({});
    }
  }, [isOpen]);

  // Fires ~400ms after the face's mouth swaps to happy/sad (see the
  // FaceNotification's onOutcomeComplete below) — the result text
  // ("Message sent"/"didn't send") fades/slides in only then, rather than
  // appearing instantly alongside the expression change.
  const revealResult = contextSafe(() => {
    if (!resultRef.current) return;
    gsap.fromTo(
      resultRef.current,
      { opacity: 0, y: reduced ? 0 : 20 },
      { opacity: 1, y: 0, duration: reduced ? 0 : 0.5, ease: "back.out(1.5)" }
    );
  });

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
  };
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
  };
  const handleMessageBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setErrors((prev) => ({
      ...prev,
      message: validateMessage(e.target.value),
    }));
  };
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageLength(e.target.value.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const newErrors = validate(formRef.current);
    setErrors(newErrors);
    if (newErrors.name) {
      nameInputRef.current?.focus();
      return;
    }
    if (newErrors.email) {
      emailInputRef.current?.focus();
      return;
    }
    if (newErrors.message) {
      messageInputRef.current?.focus();
      return;
    }

    // Spam guards. Both fake the exact same success state a real send
    // produces — no EmailJS call, and no distinguishable error/behavior a
    // bot could use to learn it was caught (a visible rejection would
    // just teach it to leave the honeypot blank or wait 2 seconds).
    const honeypotFilled = !!honeypotRef.current?.value;
    const submittedTooFast =
      Date.now() - openedAtRef.current < MIN_HUMAN_SUBMIT_MS;
    if (honeypotFilled || submittedTooFast) {
      setStatus({ type: "success", message: SUCCESS_MESSAGE });
      formRef.current.reset();
      setErrors({});
      setMessageLength(0);
      return;
    }

    // Trim before sending: sendForm reads the form's *current* DOM values
    // directly, so trimming has to happen by writing the trimmed value
    // back into these elements first — transforming a FormData copy
    // wouldn't be seen by sendForm at all. The sendForm call itself right
    // below is otherwise untouched.
    const nameEl = formRef.current.elements.namedItem(
      "name"
    ) as HTMLInputElement;
    const emailEl = formRef.current.elements.namedItem(
      "email"
    ) as HTMLInputElement;
    const messageEl = formRef.current.elements.namedItem(
      "message"
    ) as HTMLTextAreaElement;
    nameEl.value = nameEl.value.trim();
    emailEl.value = emailEl.value.trim();
    messageEl.value = messageEl.value.trim();

    setSending(true);
    setStatus(null);

    // The sending state (bounce + neutral mouth) starts the moment
    // `sending` flips true (see the FaceNotification mount below) —
    // immediately, not after this delay. SENDING_MIN_DISPLAY_MS is a
    // *minimum display* floor under that state, not a startup delay: a
    // fast response still waits this long before the outcome plays, so it
    // never reads as a flicker; a slow response plays the outcome the
    // moment it resolves, with no extra wait stacked on top.
    const start = Date.now();
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      await waitForMinDisplay(start, SENDING_MIN_DISPLAY_MS);
      setStatus({ type: "success", message: SUCCESS_MESSAGE });
      formRef.current?.reset();
      setErrors({});
      setMessageLength(0);
    } catch (error) {
      console.error(error);
      await waitForMinDisplay(start, SENDING_MIN_DISPLAY_MS);
      setStatus({
        type: "error",
        message:
          "Something went wrong sending that. Try again, or email me directly.",
      });
    } finally {
      setSending(false);
    }
  };

  // Sending/result mode: once a submit is in flight (or resolved), the
  // face character replaces the name/email/message fields for the rest of
  // this panel-open session — there's nothing left to edit.
  const showIllustration = sending || status !== null;
  // Used by both the success ("Go back") and failure ("Try again") result
  // buttons — same reset either way, back to the empty form.
  const backToForm = () => setStatus(null);

  return {
    errors,
    sending,
    status,
    messageLength,
    showIllustration,
    formRef,
    emailInputRef,
    messageInputRef,
    honeypotRef,
    resultRef,
    revealResult,
    handleNameBlur,
    handleEmailBlur,
    handleMessageBlur,
    handleMessageChange,
    handleSubmit,
    backToForm,
  };
}
