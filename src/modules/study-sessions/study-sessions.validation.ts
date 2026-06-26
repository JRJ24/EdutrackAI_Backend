import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createStudySessionSchema = z.object({
  userId: z.string().uuid(),
  subjectId: z.string().uuid(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  notes: z.string().trim().min(1),
  studyMethod: z.string().trim().min(1),
  productivityRating: z.coerce.number().int().min(1).max(5),
});

export const updateStudySessionSchema = nonEmptyObject(
  createStudySessionSchema.partial().omit({ userId: true, subjectId: true }),
);

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type UpdateStudySessionInput = z.infer<typeof updateStudySessionSchema>;