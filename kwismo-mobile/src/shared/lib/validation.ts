/**
 * Password & Form Validation Utilities for Kwismo
 */

export interface PasswordCriteria {
  minLength: boolean;      // Minimum 8 characters
  hasUppercase: boolean;   // At least 1 uppercase letter
  hasLowercase: boolean;   // At least 1 lowercase letter
  hasNumber: boolean;      // At least 1 number
  hasSymbol: boolean;      // At least 1 special character/symbol
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  criteria: PasswordCriteria;
}

/**
 * Validate password against strict security criteria:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special symbol
 */
export function validatePassword(password: string): PasswordValidationResult {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;
  const isValid = score === 5;

  return {
    isValid,
    score,
    criteria,
  };
}

/**
 * Basic Email validation
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Phone number validation (Cameroon/International)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15;
}
