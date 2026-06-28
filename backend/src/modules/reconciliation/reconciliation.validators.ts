import { z } from 'zod';

export const resolveReconciliationSchema = z.object({
  goal_id: z.string().min(1),
  action: z.enum(['match', 'reject']),
  notes: z.string().max(1000).optional(),
});

export type ResolveReconciliationDto = z.infer<typeof resolveReconciliationSchema>;
