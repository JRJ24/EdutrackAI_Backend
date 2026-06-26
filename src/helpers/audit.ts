import { prisma } from "../database/prisma";

type RecordAuditInput = {
  userId?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type JsonInput = string | number | boolean | { [key: string]: JsonInput } | JsonInput[];

export const recordAudit = async (data: RecordAuditInput) => {
  return prisma.auditLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      entityName: data.entityName,
      entityId: data.entityId ?? null,
      oldValues: (data.oldValues ?? undefined) as JsonInput | undefined,
      newValues: (data.newValues ?? undefined) as JsonInput | undefined,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    },
  });
};