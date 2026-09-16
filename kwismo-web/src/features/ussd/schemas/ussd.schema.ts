import { z } from 'zod';

export const countrySchema = z.object({
  nom: z.string().min(1, 'Le nom du pays est obligatoire'),
  code_pays: z.string().min(1, 'L indicatif ou code pays est obligatoire'),
  est_par_defaut: z.boolean().default(false),
});

export const operatorSchema = z.object({
  nom: z.string().min(1, 'Le nom de l opérateur est obligatoire'),
  country_id: z.string().min(1, 'Le pays est obligatoire'),
  prefixes: z.array(z.string()).default([]),
});

export const ussdActionSchema = z.object({
  operator_id: z.string().min(1, 'L opérateur est obligatoire'),
  nom_action: z.string().min(1, 'Le nom de l action est obligatoire'),
  code_ussd: z.string().min(1, 'Le code USSD est obligatoire'),
  format: z.string().min(1, 'Le format USSD est obligatoire'),
});

export type CountryFormValues = z.infer<typeof countrySchema>;
export type OperatorFormValues = z.infer<typeof operatorSchema>;
export type UssdActionFormValues = z.infer<typeof ussdActionSchema>;
