import { z } from 'zod';

export const createGoalSchema = z.object({
  organization_id: z.string().min(1).optional(),
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  target_amount: z.number().positive(),
  category: z.enum(['community_project', 'wedding', 'religious', 'education', 'business', 'personal']),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const closeOutGoalSchema = z.object({
  account_number: z.string().regex(/^\d{10}$/, 'Use a 10 digit destination account number'),
  account_name: z.string().min(2).max(255),
  bank_code: z.string().min(2).max(20),
  amount: z.number().positive().optional(),
  narration: z.string().max(120).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CloseOutGoalInput = z.infer<typeof closeOutGoalSchema>;
