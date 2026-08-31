// Validation regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

// Validation constraints
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 1000;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
// RFC 5321's actual limit on a full email address.
export const EMAIL_MAX_LENGTH = 254;

// Error messages
export const ERROR_MESSAGES = {
  FIRST_NAME_REQUIRED: 'First name is required.',
  LAST_NAME_REQUIRED: 'Last name is required.',
  EMAIL_REQUIRED: 'Email is required.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PHONE_REQUIRED: 'Phone number is required.',
  PHONE_INVALID: 'Please enter a valid phone number.',
  MESSAGE_REQUIRED: 'Message is required.',
  MESSAGE_TOO_SHORT: `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`,
  MESSAGE_TOO_LONG: `Message must not exceed ${MESSAGE_MAX_LENGTH} characters.`,
  NAME_REQUIRED: 'Name is required.',
  NAME_TOO_SHORT: `Name must be at least ${NAME_MIN_LENGTH} characters.`,
  NAME_TOO_LONG: `Name must not exceed ${NAME_MAX_LENGTH} characters.`,
} as const;

// Form field validation errors type
export type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
};
