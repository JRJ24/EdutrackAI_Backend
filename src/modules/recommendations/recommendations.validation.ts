import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createRecommendationSchema = z.object({
  userId: z.string().uuid(),
  subjectId: z.string().uuid(),
  resourceId: z.string().uuid(),
  type: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  priority: z.string().trim().min(1),
  status: z.string().trim().min(1),
});

export const updateRecommendationSchema = nonEmptyObject(
  createRecommendationSchema.partial().omit({ userId: true, subjectId: true, resourceId: true }),
);

export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>;
export type UpdateRecommendationInput = z.infer<typeof updateRecommendationSchema>;