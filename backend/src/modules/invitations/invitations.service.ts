import { v4 as uuid } from 'uuid';
import { Errors } from '../../lib/errors';
import { logAudit } from '../../lib/audit';
import { AuditAction } from '../../shared/types/enums';
import { sendEmail, invitationEmail } from '../../lib/email';
import { env } from '../../config/env';
import { invitationsRepository } from './invitations.repository';
import { goalsRepository } from '../goals/goals.repository';
import { usersRepository } from '../users/users.repository';
import type { SendInvitationDto } from './invitations.validators';

export const invitationsService = {
  async sendToGoal(userId: string, goalId: string, body: SendInvitationDto) {
    const goal = await goalsRepository.findByIdRaw(goalId, userId);
    if (!goal) throw Errors.notFound('Goal');

    const inviter = await usersRepository.findById(userId);
    const inviterName = (inviter?.full_name as string | undefined) ?? 'Someone';
    const goalTitle = goal.title as string;
    const slug = (goal.slug as string | null) ?? goalId;
    const contributionLink = `${env.FRONTEND_URL}/g/${slug}`;

    const results = await Promise.all(
      body.recipients.map(async (r) => {
        const token = uuid().slice(0, 16);
        const saved = await invitationsRepository.insert({
          id: `inv_${uuid().replace(/-/g, '').slice(0, 12)}`,
          goal_id: goalId,
          invited_by: userId,
          email: r.email,
          name: r.name,
          channel: body.channel,
          token,
          message: body.message,
        });

        if (body.channel === 'email') {
          const { subject, html } = invitationEmail(goalTitle, inviterName, contributionLink, body.message);
          await sendEmail({ to: { email: r.email, name: r.name }, subject, html });
        }

        await logAudit({
          action: AuditAction.InvitationSent,
          actor_id: userId,
          resource_type: 'invitation',
          resource_id: saved.id as string,
          metadata: { goal_id: goalId, email: r.email },
        });

        return saved;
      }),
    );

    return results;
  },

  async listByGoal(userId: string, goalId: string) {
    const goal = await goalsRepository.findByIdRaw(goalId, userId);
    if (!goal) throw Errors.notFound('Goal');
    return invitationsRepository.findByGoal(goalId);
  },

  async accept(token: string) {
    const invitation = await invitationsRepository.findByToken(token);
    if (!invitation) throw Errors.notFound('Invitation');
    await invitationsRepository.updateStatus(invitation.id as string, 'accepted');
    return { accepted: true, goal_id: invitation.goal_id };
  },
};
