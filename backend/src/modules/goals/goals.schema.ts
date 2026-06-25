import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  target_amount: z.number().positive(),
  category: z.enum(['community_project', 'wedding', 'religious', 'education', 'business', 'personal']),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
