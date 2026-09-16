import { z } from 'zod';

export const profileUpdateSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  langue: z.enum(['fr', 'en']).default('fr'),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
