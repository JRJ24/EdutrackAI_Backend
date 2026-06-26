import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  type: z.string().trim().min(1),
  scheduleAt: z.coerce.date().optional(),
  isRead: z.boolean().optional(),
});

export const updateNotificationSchema = nonEmptyObject(
  createNotificationSchema.partial().omit({ userId: true }),
);

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;