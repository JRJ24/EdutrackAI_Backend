import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const updateStudyPlanActivitySchema = nonEmptyObject(
  z.object({
    scheduledFor: z.coerce.date().optional(),
    durationMinutes: z.coerce.number().int().min(10).max(180).optional(),
    status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
  }),
);

export type UpdateStudyPlanActivityInput = z.infer<typeof updateStudyPlanActivitySchema>;
