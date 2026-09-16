import { z } from 'zod';

export const userStatusSchema = z.object({
  statut: z.enum(['active', 'suspended', 'banned']),
});

export const updateUserSchema = z.object({
  nom: z.string().min(2, 'users.validation.nameMin').optional(),
  prenom: z.string().min(2, 'users.validation.surnameMin').optional(),
  email: z.string().email('users.validation.invalidEmail').optional(),
  role: z.string().optional(),
  langue: z.enum(['fr', 'en']).optional(),
});

export const createUserSchema = z.object({
  nom: z.string().min(2, 'users.validation.nameMin'),
  prenom: z.string().min(2, 'users.validation.surnameMin'),
  email: z.string().email('users.validation.invalidEmail'),
  role: z.string().default('user'),
  langue: z.enum(['fr', 'en']).default('fr'),
});

export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
