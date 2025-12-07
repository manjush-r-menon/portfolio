import { useState, RefObject } from 'react';
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
  ERROR_MESSAGES,
  FormErrors,
} from '@/utils/validation';

export function useContactFormValidation(formRef: RefObject<HTMLFormElement | null>) {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateInput = (): boolean => {
    if (!formRef.current) return false;

    const formData = new FormData(formRef.current);
    const firstName = String(formData.get('first_name') || '').trim();
    const lastName = String(formData.get('last_name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const newErrors: FormErrors = {};

    // Validate first name
    if (!firstName) {
      newErrors.firstName = ERROR_MESSAGES.FIRST_NAME_REQUIRED;
    }

    // Validate last name
    if (!lastName) {
      newErrors.lastName = ERROR_MESSAGES.LAST_NAME_REQUIRED;
    }

    // Validate email
    if (!email) {
      newErrors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = ERROR_MESSAGES.EMAIL_INVALID;
    }

    // Validate phone
    if (!phone) {
      newErrors.phone = ERROR_MESSAGES.PHONE_REQUIRED;
    } else if (!PHONE_REGEX.test(phone)) {
      newErrors.phone = ERROR_MESSAGES.PHONE_INVALID;
    }

    // Validate message
    if (!message) {
      newErrors.message = ERROR_MESSAGES.MESSAGE_REQUIRED;
    } else if (message.length < MESSAGE_MIN_LENGTH) {
      newErrors.message = ERROR_MESSAGES.MESSAGE_TOO_SHORT;
    } else if (message.length > MESSAGE_MAX_LENGTH) {
      newErrors.message = ERROR_MESSAGES.MESSAGE_TOO_LONG;
    }

    setErrors(newErrors);

    // Return true only if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return { errors, validateInput, clearErrors };
}
