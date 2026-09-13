import {
  EMAIL_REGEX,
  ERROR_MESSAGES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "@/utils/validation";

export type FormErrors = { name?: string; email?: string; message?: string };

export function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.NAME_REQUIRED;
  if (trimmed.length < NAME_MIN_LENGTH) return ERROR_MESSAGES.NAME_TOO_SHORT;
  if (trimmed.length > NAME_MAX_LENGTH) return ERROR_MESSAGES.NAME_TOO_LONG;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.EMAIL_REQUIRED;
  if (!EMAIL_REGEX.test(trimmed)) return ERROR_MESSAGES.EMAIL_INVALID;
  return undefined;
}

export function validateMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return ERROR_MESSAGES.MESSAGE_REQUIRED;
  if (trimmed.length < MESSAGE_MIN_LENGTH) return ERROR_MESSAGES.MESSAGE_TOO_SHORT;
  if (trimmed.length > MESSAGE_MAX_LENGTH) return ERROR_MESSAGES.MESSAGE_TOO_LONG;
  return undefined;
}

// Shared by both submit-time validation and each field's onBlur handler,
// so "leaving a field" and "hitting submit" can never disagree about
// what counts as valid.
export function validate(formEl: HTMLFormElement): FormErrors {
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
