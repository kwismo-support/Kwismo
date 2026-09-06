import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.invalidEmail' }),
  password: z
    .string()
    .min(6, { message: 'validation.minLength' }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.required' })
    .email({ message: 'validation.invalidEmail' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: 'validation.minLength' }),
  confirmPassword: z
    .string()
    .min(8, { message: 'validation.minLength' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'validation.passwordMismatch',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const partnerRegisterSchema = z.object({
  nomEntreprise: z.string().min(2, { message: 'validation.required' }),
  typePartenariat: z.string().min(1, { message: 'validation.required' }),
  nomContact: z.string().min(2, { message: 'validation.required' }),
  prenomContact: z.string().min(2, { message: 'validation.required' }),
  email: z.string().min(1, { message: 'validation.required' }).email({ message: 'validation.invalidEmail' }),
  telephone: z.string().min(6, { message: 'validation.required' }),
  message: z.string().optional(),
});

export type PartnerRegisterInput = z.infer<typeof partnerRegisterSchema>;

