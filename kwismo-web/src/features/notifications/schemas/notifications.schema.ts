import { z } from 'zod';

export const notificationItemSchema = z.object({
  id: z.string().min(1),
  texte: z.string().min(1),
  lu: z.boolean(),
  date: z.string(),
});

export type NotificationItemFormValues = z.infer<typeof notificationItemSchema>;
