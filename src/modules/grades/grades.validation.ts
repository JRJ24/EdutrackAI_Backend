import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createGradeSchema = z.object({
  userId: z.string().uuid(),
  subjectId: z.string().uuid(),
  gradeValue: z.coerce.number().min(0).max(100),
  gradeType: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.coerce.date(),
});

export const updateGradeSchema = nonEmptyObject(
  createGradeSchema.partial().omit({ userId: true, subjectId: true }),
);

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;