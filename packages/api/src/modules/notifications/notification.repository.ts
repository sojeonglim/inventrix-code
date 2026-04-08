import prisma from '../../shared/database/connection.js';

export class NotificationRepository {
  async create(data: { userId: string; type: string; title: string; message: string; data?: unknown }) {
    return prisma.notification.create({ data: { userId: data.userId, type: data.type as never, title: data.title, message: data.message, data: data.data ? JSON.parse(JSON.stringify(data.data)) : null } });
  }
  async findByUserId(userId: string) { return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }); }
  async markAsRead(id: string) { return prisma.notification.update({ where: { id }, data: { read: true } }); }
  async countUnread(userId: string) { return prisma.notification.count({ where: { userId, read: false } }); }
}
