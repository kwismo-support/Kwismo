import { z } from 'zod';

export const addPhoneSchema = z.object({
  valeur: z.string().min(8, 'errors:validation.invalidPhone'),
});

export type AddPhoneInput = z.infer<typeof addPhoneSchema>;

export const verifyOtpSchema = z.object({
  code: z.string().min(4, 'errors:validation.required').max(8),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const compromiseSchema = z.object({
  type_incident: z.string().min(1, 'errors:validation.required'),
  description: z.string().min(5, 'errors:validation.minLength5'),
});

export type CompromiseInput = z.infer<typeof compromiseSchema>;

export const updateProfileSchema = z.object({
  nom: z.string().min(2, 'errors:validation.minLength2').optional(),
  prenom: z.string().min(2, 'errors:validation.minLength2').optional(),
  langue: z.enum(['fr', 'en']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const reportFraudSchema = z.object({
  telephone_suspect: z.string().min(8, 'errors:validation.invalidPhone'),
  type_fraude: z.string().min(1, 'errors:validation.required'),
  description: z.string().min(5, 'errors:validation.minLength5'),
});

export type ReportFraudInput = z.infer<typeof reportFraudSchema>;
