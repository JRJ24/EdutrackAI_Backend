import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createAcademicProfileSchema = z.object({
  user_id: z.string().uuid(),
  academicLevel: z.string().trim().min(1),
  learningStyle: z.string().trim().min(1),
  preferredStudyTime: z.string().trim().min(1),
  weeklyStudyGoalHours: z.coerce.number().int().min(0).max(168),
  mainDifficulties: z.string().trim().min(1),
});

export const updateAcademicProfileSchema = nonEmptyObject(
  createAcademicProfileSchema.partial().omit({ user_id: true }),
);

export type CreateAcademicProfileInput = z.infer<typeof createAcademicProfileSchema>;
export type UpdateAcademicProfileInput = z.infer<typeof updateAcademicProfileSchema>;