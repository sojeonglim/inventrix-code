import { UserRepository } from './user.repository.js';
import { Role } from '@prisma/client';
import { eventBus } from '../../shared/event-bus/event-bus.js';
import { RoleChangedEvent } from '../../shared/event-bus/events.js';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUsers() {
    return this.userRepo.findAll();
  }

  async updateUserRole(id: string, role: Role, changedBy: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    const oldRole = user.role;
    const updated = await this.userRepo.updateRole(id, role);
    eventBus.emit<RoleChangedEvent>({ type: 'RoleChanged', userId: id, oldRole, newRole: role, changedBy, timestamp: new Date().toISOString() });
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }
}
