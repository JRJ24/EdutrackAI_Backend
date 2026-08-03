import { z } from "zod";

export const activeToggleSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().trim().min(1).optional(),
});

export const roleChangeSchema = z.object({
  roleId: z.string().uuid(),
  reason: z.string().trim().min(1).optional(),
});

export const auditLogFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: z.string().trim().min(1).optional(),
  entityName: z.string().trim().min(1).optional(),
  userId: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
});

export type ActiveToggleInput = z.infer<typeof activeToggleSchema>;
export type RoleChangeInput = z.infer<typeof roleChangeSchema>;
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>;
