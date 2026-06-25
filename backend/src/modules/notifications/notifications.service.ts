import { Errors } from '../../lib/errors';
import { notificationsRepository } from './notifications.repository';

export const notificationsService = {
  async list(userId: string, query: { unread_only?: boolean; page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const { rows, total } = await notificationsRepository.findAll(userId, {
      unreadOnly: query.unread_only ?? false,
      page,
      perPage,
    });
    return { data: rows, meta: { page, per_page: perPage, total } };
  },

  async unreadCount(userId: string) {
    const count = await notificationsRepository.countUnread(userId);
    return { count };
  },

  async markRead(userId: string, notificationId: string) {
    const affected = await notificationsRepository.markOneRead(notificationId, userId);
    if (!affected) throw Errors.notFound('Notification');
  },

  async markAllRead(userId: string) {
    await notificationsRepository.markAllRead(userId);
  },
};
