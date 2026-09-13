"use client";

import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "@/utils/hooks/use-reduced-motion";
import { FaceNotification } from "./face-notification/face-notification";
import { useBloomTimeline } from "./use-bloom-timeline";
import { useContactSubmit } from "./use-contact-submit";
import {
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
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
 * Email delivery uses emailjs.sendForm(...) directly (env vars:
 * NEXT_PUBLIC_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY) rather than a
 * new API route. Once a submit is in flight, the face character (see
 * ./face-notification/face-notification.tsx) replaces the name/email/
 * message fields — there's no separate "submit disabled while sending"
 * state to manage since the button itself is gone in that mode.
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
 *
 * Split three ways: this file is a thin composition, useBloomTimeline
 * owns the open/close lifecycle (bloom animation + focus-trap/scroll-lock,
 * since both are "what happens while this modal is open/closed"), and
 * useContactSubmit owns the form itself (validation, spam guards, the
 * EmailJS call). validation.ts holds the pure field validators either one
 * could need without pulling in React or GSAP.
 */

const DARK_LABEL_CLASSES =
  "block font-sans text-xs tracking-[0.06em] text-bg/60 uppercase";
const DARK_INPUT_BASE =
  "block w-full border-0 border-b bg-transparent px-0 py-2 font-sans text-sm text-bg placeholder:text-bg/40 outline-none transition-colors";
const DARK_INPUT_NORMAL = "border-bg/25 focus:border-accent";
const DARK_INPUT_ERROR = "border-red-400 focus:border-red-400";

interface BloomPanelProps {
  triggerLabel?: string;
}

export function BloomPanel({ triggerLabel = "Connect now" }: BloomPanelProps) {
  const reduced = useReducedMotion();
  // Owned here, not by either hook: useBloomTimeline focuses it when the
  // panel opens, useContactSubmit focuses it when name validation fails
  // on submit, and the JSX below attaches it to the actual <input>.
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    toggle,
    contextSafe,
    mounted,
    panelSize,
    triggerRef,
    panelRef,
    backdropRef,
    sliderRef,
    formWrapRef,
    fieldRefs,
    footerRef,
  } = useBloomTimeline({ reduced, initialFocusRef: nameInputRef });

  const {
    errors,
    messageLength,
    status,
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
  } = useContactSubmit({ isOpen, reduced, nameInputRef, contextSafe });

  const panelId = useId();
  const nameFieldId = `${panelId}-name`;
  const emailFieldId = `${panelId}-email`;
  const messageFieldId = `${panelId}-message`;
  const honeypotFieldId = `${panelId}-company`;
  const nameErrorId = `${nameFieldId}-error`;
  const emailErrorId = `${emailFieldId}-error`;
  const messageErrorId = `${messageFieldId}-error`;

  return (
    <>
      <button
        ref={triggerRef}
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
              // Tells DualCursor (components/features/cursor/dual-cursor.tsx)
              // to render in white here — the default dark cursor dot is the
              // same #141412 as this panel's own bg-ink, i.e. literally
              // invisible against it.
              data-cursor-light
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
                    // Negative margin cancels the added padding exactly
                    // (-12px + 12px = 0), so the icon stays visually flush
                    // in the same spot while the actual tap target grows to
                    // ~44px — this panel covers nearly the whole viewport
                    // on mobile, leaving almost no backdrop to tap outside
                    // of it to close, so this button is the one reliable
                    // way out there and a small icon-hugging hit area
                    // (the previous p-1 was ~28px) was too easy to miss/
                    // mistap.
                    className="-mt-3 -mr-3 rounded-sm p-3 text-bg/60 transition-colors hover:text-bg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
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

                  {showIllustration ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
                      <FaceNotification
                        outcome={
                          status
                            ? status.type === "success"
                              ? "success"
                              : "failure"
                            : null
                        }
                        onOutcomeComplete={revealResult}
                      />
                      <div
                        ref={resultRef}
                        aria-live="polite"
                        className="w-full text-center"
                        style={{ opacity: 0 }}
                      >
                        {status && (
                          <>
                            <p
                              className={`font-sans text-sm font-bold ${
                                status.type === "success"
                                  ? "text-[#7fc98c]"
                                  : "text-red-400"
                              }`}
                            >
                              {status.message}
                            </p>
                            <button
                              type="button"
                              onClick={backToForm}
                              className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-semibold text-ink transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-bg focus-visible:outline-none"
                            >
                              {status.type === "success"
                                ? "Go back"
                                : "Try again"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
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
                            {/* Fixed-height slot regardless of whether an
                                error is shown: an error appearing here must
                                not shift anything below it (including the
                                submit button) — a shift landing between a
                                click's mousedown and mouseup can make the
                                click miss the button entirely, since mouseup
                                hit-tests whatever is now at the original
                                screen coordinates. */}
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
                          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 font-sans text-sm font-medium text-ink transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-bg focus-visible:outline-none"
                        >
                          Send message
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
