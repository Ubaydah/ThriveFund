import bcrypt from 'bcryptjs';
import { Errors } from '../../lib/errors';
import { usersRepository } from './users.repository';
import type { UpdateProfileInput, ChangePasswordInput, NotificationPrefsInput } from './users.schema';

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw Errors.notFound('User');
    return user;
  },

  async updateProfile(userId: string, body: UpdateProfileInput) {
    const fields: Record<string, unknown> = {};
    if (body.full_name !== undefined)    fields.full_name    = body.full_name;
    if (body.phone_number !== undefined) fields.phone_number = body.phone_number;

    if (!Object.keys(fields).length) throw Errors.validation('No fields provided to update');

    const updated = await usersRepository.update(userId, fields);
    if (!updated) throw Errors.notFound('User');
    return updated;
  },

  async changePassword(userId: string, body: ChangePasswordInput) {
    const user = await usersRepository.findById(userId);
    if (!user) throw Errors.notFound('User');

    const valid = await bcrypt.compare(body.current_password, user.password_hash as string);
    if (!valid) throw Errors.validation('Current password is incorrect');

    const hash = await bcrypt.hash(body.new_password, 12);
    await usersRepository.updatePasswordHash(userId, hash);
  },

  async getNotificationPrefs(userId: string) {
    const prefs = await usersRepository.findNotificationPrefs(userId);
    return prefs ?? { payments: true, goals: true, reminders: false, marketing: false };
  },

  async updateNotificationPrefs(userId: string, body: NotificationPrefsInput) {
    await usersRepository.upsertNotificationPrefs(userId, body);
    return this.getNotificationPrefs(userId);
  },
};
