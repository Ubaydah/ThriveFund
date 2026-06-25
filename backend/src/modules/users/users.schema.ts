import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export const notificationPrefsSchema = z.object({
  payments: z.boolean().optional(),
  goals: z.boolean().optional(),
  reminders: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
