import { z } from 'zod';

export const verifyNumberSchema = z.object({
  valeur: z.string().min(8, 'numbers.validation.phoneMin'),
  country_id: z.string().optional(),
});

export const numberStatusSchema = z.object({
  statut: z.enum(['securise', 'a_signaler', 'frauduleux']),
  reanalyser: z.boolean().default(false),
});

export type VerifyNumberInput = z.infer<typeof verifyNumberSchema>;
export type NumberStatusInput = z.infer<typeof numberStatusSchema>;
