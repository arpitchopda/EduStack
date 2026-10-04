import { prisma } from '@/lib/prisma';

export async function logAuditAction(userId, action, description) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        description,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
