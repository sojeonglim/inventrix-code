import prisma from '../database/connection.js';
import { logger } from './logger.js';

interface AuditEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  outcome?: string;
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        previousValue: entry.previousValue ? JSON.parse(JSON.stringify(entry.previousValue)) : null,
        newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        outcome: entry.outcome ?? 'success',
      },
    });
  } catch (err) {
    logger.error({ err, entry }, 'Failed to write audit log');
  }
}
