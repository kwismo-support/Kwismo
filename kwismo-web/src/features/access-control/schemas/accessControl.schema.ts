import { z } from 'zod';

export const createRoleSchema = z.object({
  nomRole: z.string().min(2, { message: 'validation.required' }),
  description: z.string().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const createAccessRightSchema = z.object({
  roleId: z.string().min(1, { message: 'validation.required' }),
  permission: z.string().min(1, { message: 'validation.required' }),
  description: z.string().optional(),
});

export type CreateAccessRightInput = z.infer<typeof createAccessRightSchema>;
