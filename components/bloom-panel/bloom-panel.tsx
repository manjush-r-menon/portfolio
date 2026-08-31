"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import emailjs from "@emailjs/browser";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  ERROR_MESSAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "@/utils/validation";

/**
 * Ported from /references/ (index.html + script.js + style.css) — a
 * paused GSAP timeline scrubbed via tl.play()/tl.reverse(), a pill that
 * blooms into a full panel, a staggered 3D-flip content reveal, and a
 * vertically-sliding button-label swap.
 *
 * The trigger is a plain inline button (rendered wherever this component
 * is placed in the page — see app/contact/page.tsx, in the gap between
 * the details column's divider line and the EMAIL/PHONE/BASED block) and
 * scrolls with the page like any other content. The panel is a *separate*
 * fixed, viewport-centered element — deliberately not trying to bloom
 * from the trigger's own (scrolling, resizing) position, which would
 * reintroduce real edge-overflow and resize-recalculation complexity for
 * no real benefit. Centered rather than corner-anchored: a corner only
 * made sense when the trigger itself lived in that same corner (an
 * earlier version of this component did that); with the trigger inline,
 * a corner anchor would be arbitrary, whereas centering is the standard,
 * spatially-neutral pattern once trigger and panel have no visual
 * relationship. It also has a nice technical property here: the panel's
 * centering is pure CSS (`top-1/2 left-1/2` + `-translate-1/2`), and CSS
 * percentage-based transforms are recalculated against the element's
 * *current* box size every frame — so as long as GSAP only ever animates
 * width/height/opacity/borderRadius below (never x/y/position), the panel
 * stays perfectly centered through the entire bloom with no extra math,
 * simpler than the corner-anchor version's bleed offset it replaces.
 * Since a centered panel with nothing behind it reads as floating/
 * disconnected, it also gets a dimmed click-to-close backdrop — a
 * reasonable default for this pattern, not something asked for verbatim.
 * Because the panel is no longer anchored to where the trigger sits, it
 * carries its own in-panel close (×) too, since the trigger can scroll
 * out of view once the page scrolls.
 *
 * Rendered via createPortal(..., document.body): PageSettle (app-wide,
 * see app/layout.tsx) leaves a lingering inline `transform` at rest,
 * which makes <main> establish a stacking/containing-block context that
 * traps any `position: fixed` descendant — this repo already hit exactly
 * this bug once (see card-reveal.module.css's .servicesHeaderPortal and
 * pinned-reveal.tsx's createPortal usage). Portaling to <body> sidesteps
 * it the same way that fix did. Only the backdrop+panel are portaled —
 * the trigger button is plain in-place JSX, no portal needed for it.
 *
 * Email delivery reuses the exact emailjs.sendForm(...) call already
 * wired in components/contact-me/contact-me-section.tsx (same env vars:
 * NEXT_PUBLIC_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY) rather than a
 * new API route. That call itself, the success/error message UI, and the
 * disabled={sending} submit guard are all deliberately untouched here —
 * see the conversation this was scoped in.
 *
 * Validation/spam-hardening (added after an audit of the original build):
 * per-field validators run both on blur and on submit; every field is
 * trimmed before both validation and sending (sendForm reads live DOM
 * values, so trimming happens by writing the trimmed value back into the
 * form elements right before the call, not by transforming a FormData
 * copy sendForm would never see); and two spam guards — a honeypot field
 * and a minimum-elapsed-time trap — both silently fake a successful send
 * rather than calling EmailJS or surfacing any signal a bot could learn
 * from.
 */

// Sized generously enough that typical desktop/laptop viewports fit all
// form content without the internal scrollbar ever appearing (verified:
// ~625px of actual content vs. up to 660px available here — the reserved
// min-h-[1.5rem] error slots on each field, added for click reliability
// [see the layout-shift-during-click comment below], added ~72px of fixed
// height that the original 600px cap didn't account for) — scroll only
// kicks in as a fallback on genuinely short viewports where the height
// clamp below pushes the panel under that.
const PANEL_MAX_WIDTH = 480;
const PANEL_MAX_HEIGHT = 660;

// No human fills a 3-field form and submits faster than this.
const MIN_HUMAN_SUBMIT_MS = 2000;

type FormErrors = { name?: string; email?: string; message?: string };

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.NAME_REQUIRED;
  if (trimmed.length < NAME_MIN_LENGTH) return ERROR_MESSAGES.NAME_TOO_SHORT;
  if (trimmed.length > NAME_MAX_LENGTH) return ERROR_MESSAGES.NAME_TOO_LONG;
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!EMAIL_REGEX.test(trimmed)) return ERROR_MESSAGES.EMAIL_INVALID;
  return undefined;
}

function validateMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.MESSAGE_REQUIRED;
  if (trimmed.length < MESSAGE_MIN_LENGTH) return ERROR_MESSAGES.MESSAGE_TOO_SHORT;
  if (trimmed.length > MESSAGE_MAX_LENGTH) return ERROR_MESSAGES.MESSAGE_TOO_LONG;
  return undefined;
}

// Shared by both submit-time validation and each field's onBlur handler,
// so "leaving a field" and "hitting submit" can never disagree about
// what counts as valid.
function validate(formEl: HTMLFormElement): FormErrors {
  const data = new FormData(formEl);
  const errors: FormErrors = {};

  const nameError = validateName((data.get("name") as string) ?? "");
  if (nameError) errors.name = nameError;

  const emailError = validateEmail((data.get("email") as string) ?? "");
  if (emailError) errors.email = emailError;

  const messageError = validateMessage((data.get("message") as string) ?? "");
  if (messageError) errors.message = messageError;

  return errors;
}

const DARK_LABEL_CLASSES =
  "block font-sans text-xs tracking-[0.06em] text-bg/60 uppercase";
const DARK_INPUT_BASE =
  "block w-full border-0 border-b bg-transparent px-0 py-2 font-sans text-sm text-bg placeholder:text-bg/40 outline-none transition-colors";
const DARK_INPUT_NORMAL = "border-bg/25 focus:border-accent";
const DARK_INPUT_ERROR = "border-red-400 focus:border-red-400";

export function BloomPanel({
  triggerLabel = "Connect now",
}: {
  triggerLabel?: string;
}) {
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [panelSize, setPanelSize] = useState({
    width: PANEL_MAX_WIDTH,
    height: PANEL_MAX_HEIGHT,
  });
  // `typeof document !== "undefined"` alone isn't enough of a guard for a
  // portal: it's false during SSR but true from the client's very first
  // render, so createPortal would fire during hydration itself, and React
  // diffs that against the server's (portal-less) output as a genuine
  // mismatch. Needs to start false on *both* server and the client's first
  // pass, only flipping after a client-only effect — same shape as the
  // `inView` gate pinned-reveal.tsx uses around its own createPortal call.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Timestamp the panel was last opened — the "no human is this fast"
  // trap below measures from here, not from component mount (the trigger
  // button, and therefore this component, is mounted the whole time the
  // Contact page is open).
  const openedAtRef = useRef(0);

  const panelId = useId();
  const nameFieldId = `${panelId}-name`;
  const emailFieldId = `${panelId}-email`;
  const messageFieldId = `${panelId}-message`;
  const honeypotFieldId = `${panelId}-company`;
  const nameErrorId = `${nameFieldId}-error`;
  const emailErrorId = `${emailFieldId}-error`;
  const messageErrorId = `${messageFieldId}-error`;

  useEffect(() => {
    if (isOpen) openedAtRef.current = Date.now();
  }, [isOpen]);

  // Clamped to the viewport so the panel never overflows small screens —
  // 48px margin top+bottom, 24px left+right, comfortable for a centered
  // modal. overflow-y-auto on the form content below is the actual safety
  // net regardless of this clamp being exactly right.
  // Recomputed on resize; see the useGSAP dependencies below — a resize
  // while the panel is open will snap it shut (a rebuilt timeline starts
  // paused at 0 again), a known, accepted edge case rather than added
  // complexity to preserve mid-animation state across a rebuild.
  useEffect(() => {
    const compute = () =>
      setPanelSize({
        width: Math.min(PANEL_MAX_WIDTH, window.innerWidth - 48),
        height: Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 96),
      });
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      // Reduced motion: no bloom/flip timeline at all, and deliberately
      // bail before touching `panel`'s inline style — visibility/size are
      // driven entirely by isOpen via plain conditional classes below (a
      // CSS opacity transition, already forced ~instant site-wide by the
      // prefers-reduced-motion rule in styles/tailwind.css). `sliderRef`
      // is also never attached in this mode (see the JSX below), which
      // would trip the null-check further down anyway — this explicit
      // early return just makes that non-obvious enough to state plainly.
      if (reduced) {
        tlRef.current = null;
        return;
      }

      const panel = panelRef.current;
      const slider = sliderRef.current;
      const formWrap = formWrapRef.current;
      const footer = footerRef.current;
      const fields = fieldRefs.current;
      if (!panel || !slider || !formWrap || !footer) return;

      // Width/height/opacity/borderRadius only — deliberately never x/y —
      // so the CSS `top-1/2 left-1/2 -translate-1/2` centering (set via
      // className, untouched by GSAP) keeps recalculating against the
      // panel's current size on every frame and it stays centered
      // throughout the grow, with no bleed/offset math needed.
      gsap.set(panel, {
        width: 64,
        height: 64,
        borderRadius: 9999,
        opacity: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
      });

      tl.to(panel, {
        width: panelSize.width,
        height: panelSize.height,
        borderRadius: 24,
        opacity: 1,
        duration: 0.75,
      });

      tl.to(slider, { yPercent: -50, duration: 0.5 }, 0);

      tl.set(panel, { pointerEvents: "none" }, 0);
      tl.set(panel, { pointerEvents: "auto" }, 0.01);

      tl.set(formWrap, { pointerEvents: "none" }, 0);
      tl.set(formWrap, { pointerEvents: "auto" }, 0.5);
      tl.fromTo(
        formWrap,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0.2
      );

      tl.set(
        fields,
        {
          opacity: 0,
          rotateX: 90,
          y: 60,
          x: -16,
          transformPerspective: 300,
          transformOrigin: "bottom",
        },
        0
      );
      tl.to(
        fields,
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          x: 0,
          duration: 0.65,
          ease: "back.out(1.2)",
          stagger: 0.1,
        },
        0.45
      );

      tl.fromTo(
        footer,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.75
      );

      tlRef.current = tl;
    },
    {
      scope: panelRef,
      // `mounted` has to be here too: the portal (and therefore panelRef
      // etc.) doesn't exist in the DOM until `mounted` flips true (see its
      // declaration above), so the first run of this effect — during that
      // initial mount — no-ops on null refs. Without `mounted` in this
      // array, useGSAP never has a reason to run the callback again, and
      // the timeline permanently stays unbuilt.
      dependencies: [reduced, panelSize.width, panelSize.height, mounted],
    }
  );

  const toggle = contextSafe(() => {
    setIsOpen((open) => {
      const next = !open;
      if (!reduced) {
        if (next) tlRef.current?.play();
        else tlRef.current?.reverse();
      }
      // Closing: clear the last submit's status/validation state so it
      // doesn't linger and reappear stale the next time the panel opens.
      if (!next) {
        setStatus(null);
        setErrors({});
      }
      return next;
    });
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
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
      setStatus({
        type: "success",
        message: "Message sent — thanks, I'll get back to you soon.",
      });
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

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(
        () => {
          setStatus({
            type: "success",
            message: "Message sent — thanks, I'll get back to you soon.",
          });
          formRef.current?.reset();
          setErrors({});
          setMessageLength(0);
        },
        (error) => {
          console.error(error);
          setStatus({
            type: "error",
            message:
              "Something went wrong sending that. Try again, or email me directly.",
          });
        }
      )
      .finally(() => setSending(false));
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="group relative inline-flex h-[42px] items-center justify-center overflow-hidden rounded-full border border-ink bg-bg px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none"
      >
        <span className="relative block h-[1.2em] overflow-hidden">
          <span
            ref={reduced ? undefined : sliderRef}
            className="flex flex-col"
            style={
              reduced
                ? { transform: isOpen ? "translateY(-50%)" : "none" }
                : undefined
            }
          >
            <span className="block h-[1.2em] leading-[1.2em]">
              {triggerLabel}
            </span>
            <span className="block h-[1.2em] leading-[1.2em]">Close</span>
          </span>
        </span>
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              ref={backdropRef}
              aria-hidden="true"
              onClick={toggle}
              className={`fixed inset-0 z-[59] bg-ink/50 transition-opacity duration-300 ${
                isOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Contact form"
              className={
                reduced
                  ? `fixed top-1/2 left-1/2 z-[60] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-ink shadow-2xl transition-opacity duration-200 ${
                      isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                    }`
                  : "pointer-events-none fixed top-1/2 left-1/2 z-[60] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-ink opacity-0 shadow-2xl"
              }
              style={
                reduced
                  ? {
                      width: panelSize.width,
                      height: panelSize.height,
                      borderRadius: 24,
                    }
                  : // Matches the useGSAP rest state (gsap.set) above — a
                    // redundant-but-safe initial value so there's no gap
                    // between first paint and the layout effect applying it.
                    { width: 64, height: 64, borderRadius: 9999 }
              }
            >
              <div
                ref={formWrapRef}
                className="flex h-full flex-col overflow-y-auto px-10 pt-10 pb-10"
                style={reduced ? undefined : { opacity: 0 }}
              >
                <div className="flex items-start justify-between">
                  <p className="font-sans text-xs tracking-[0.08em] text-accent uppercase">
                    Let&apos;s talk
                  </p>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Close contact form"
                    className="-mt-1 -mr-1 rounded-sm p-1 text-bg/60 transition-colors hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-8 flex flex-1 flex-col"
                >
                  {/* Honeypot: off-screen (not display:none/visibility:hidden,
                      which some bots check for and skip), aria-hidden so
                      screen readers never announce it, tabIndex={-1} so
                      keyboard users never tab into it, autoComplete="off"
                      so browser autofill never populates it on a real
                      user's behalf. Any bot that blindly fills every
                      <input> it finds fills this one; see handleSubmit. */}
                  <div
                    className="absolute -left-[9999px] h-px w-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor={honeypotFieldId}>Company</label>
                    <input
                      ref={honeypotRef}
                      id={honeypotFieldId}
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex flex-col gap-6">
                    <div
                      ref={(el) => {
                        fieldRefs.current[0] = el;
                      }}
                      className="overflow-hidden [perspective:300px]"
                    >
                      <label
                        htmlFor={nameFieldId}
                        className={DARK_LABEL_CLASSES}
                      >
                        Name
                      </label>
                      <div className="mt-2">
                        <input
                          ref={nameInputRef}
                          id={nameFieldId}
                          name="name"
                          type="text"
                          autoComplete="name"
                          maxLength={NAME_MAX_LENGTH}
                          onBlur={handleNameBlur}
                          aria-invalid={!!errors.name}
                          aria-describedby={
                            errors.name ? nameErrorId : undefined
                          }
                          className={`${DARK_INPUT_BASE} ${errors.name ? DARK_INPUT_ERROR : DARK_INPUT_NORMAL}`}
                        />
                        {/* Fixed-height slot regardless of whether an error
                            is shown: an error appearing here must not shift
                            anything below it (including the submit button)
                            — a shift landing between a click's mousedown and
                            mouseup can make the click miss the button
                            entirely, since mouseup hit-tests whatever is now
                            at the original screen coordinates. */}
                        <div className="mt-1.5 min-h-[1.5rem]">
                          {errors.name && (
                            <p
                              id={nameErrorId}
                              className="font-sans text-xs text-red-400"
                            >
                              {errors.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      ref={(el) => {
                        fieldRefs.current[1] = el;
                      }}
                      className="overflow-hidden [perspective:300px]"
                    >
                      <label
                        htmlFor={emailFieldId}
                        className={DARK_LABEL_CLASSES}
                      >
                        Email
                      </label>
                      <div className="mt-2">
                        <input
                          ref={emailInputRef}
                          id={emailFieldId}
                          name="email"
                          type="email"
                          autoComplete="email"
                          maxLength={EMAIL_MAX_LENGTH}
                          onBlur={handleEmailBlur}
                          aria-invalid={!!errors.email}
                          aria-describedby={
                            errors.email ? emailErrorId : undefined
                          }
                          className={`${DARK_INPUT_BASE} ${errors.email ? DARK_INPUT_ERROR : DARK_INPUT_NORMAL}`}
                        />
                        <div className="mt-1.5 min-h-[1.5rem]">
                          {errors.email && (
                            <p
                              id={emailErrorId}
                              className="font-sans text-xs text-red-400"
                            >
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      ref={(el) => {
                        fieldRefs.current[2] = el;
                      }}
                      className="overflow-hidden [perspective:300px]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <label
                          htmlFor={messageFieldId}
                          className={DARK_LABEL_CLASSES}
                        >
                          Message
                        </label>
                        <span className="font-sans text-[11px] text-bg/40">
                          {messageLength}/{MESSAGE_MAX_LENGTH}
                        </span>
                      </div>
                      <div className="mt-2">
                        <textarea
                          ref={messageInputRef}
                          id={messageFieldId}
                          name="message"
                          rows={3}
                          maxLength={MESSAGE_MAX_LENGTH}
                          onBlur={handleMessageBlur}
                          onChange={handleMessageChange}
                          aria-invalid={!!errors.message}
                          aria-describedby={
                            errors.message ? messageErrorId : undefined
                          }
                          className={`${DARK_INPUT_BASE} resize-none ${errors.message ? DARK_INPUT_ERROR : DARK_INPUT_NORMAL}`}
                        />
                        <div className="mt-1.5 min-h-[1.5rem]">
                          {errors.message && (
                            <p
                              id={messageErrorId}
                              className="font-sans text-xs text-red-400"
                            >
                              {errors.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div ref={footerRef} className="mt-10">
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-bg focus-visible:outline-none"
                    >
                      {sending ? "Sending…" : "Send message"}
                    </button>
                    <div aria-live="polite">
                      {status && (
                        <p
                          className={`mt-3 font-sans text-xs ${
                            status.type === "success"
                              ? "text-[#7fc98c]"
                              : "text-red-400"
                          }`}
                        >
                          {status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
