import { Response } from 'express';
import { Role } from '@prisma/client';
import { logger } from '../../shared/logger/logger.js';

interface SSEConnection { res: Response; userId: string; role: Role; }

class SSEManager {
  private connections = new Map<string, SSEConnection>();

  addConnection(userId: string, role: Role, res: Response) {
    this.connections.set(userId, { res, userId, role });
    res.on('close', () => this.connections.delete(userId));
  }

  sendToUser(userId: string, event: { type: string; payload: unknown }) {
    const conn = this.connections.get(userId);
    if (conn) conn.res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
  }

  sendToRole(role: Role, event: { type: string; payload: unknown }) {
    for (const conn of this.connections.values()) {
      if (conn.role === role) conn.res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
    }
  }

  closeAll() {
    for (const conn of this.connections.values()) conn.res.end();
    this.connections.clear();
  }

  get connectionCount() { return this.connections.size; }
}

export const sseManager = new SSEManager();
