import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'validation.required' }),
  password: z
    .string()
    .min(6, { message: 'validation.minLength' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, { message: 'validation.required' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, { message: 'validation.minLength' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'validation.minLength' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'validation.passwordMismatch',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
