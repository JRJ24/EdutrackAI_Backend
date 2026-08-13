import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createEvaluationSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional(),
  evaluationType: z.string().trim().min(1).max(80),
  scheduledAt: z.coerce.date(),
  weight: z.coerce.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export const updateEvaluationSchema = nonEmptyObject(
  createEvaluationSchema.partial().omit({ subjectId: true }),
);

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
