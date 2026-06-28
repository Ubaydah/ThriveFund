import { z } from 'zod';

export const sendInvitationSchema = z.object({
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).min(1),
  channel: z.enum(['email', 'sms']).default('email'),
  message: z.string().max(500).optional(),
});

export type SendInvitationDto = z.infer<typeof sendInvitationSchema>;
