import prisma from '../../shared/database/connection.js';
import { Role } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    return prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
  }

  async create(data: { email: string; password: string; name: string; role?: Role }) {
    return prisma.user.create({ data });
  }

  async updateRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  }

  async updateLoginAttempts(id: string, attempts: number, lockedUntil: Date | null) {
    return prisma.user.update({ where: { id }, data: { loginAttempts: attempts, lockedUntil } });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } }).catch(() => null);
  }

  async deleteAllRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
