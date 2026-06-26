import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  level: z.string().trim().min(1),
  isActive: z.boolean().optional(),
});

export const updateSubjectSchema = nonEmptyObject(
  createSubjectSchema.partial(),
);

export const assignUserToSubjectSchema = z.object({
  userId: z.string().uuid(),
  currentAverage: z.string().trim().min(1),
  difficultyLevel: z.string().trim().min(1),
  status: z.string().trim().min(1),
});

export const updateUserSubjectSchema = nonEmptyObject(
  assignUserToSubjectSchema.partial().omit({ userId: true }),
);

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type AssignUserToSubjectInput = z.infer<typeof assignUserToSubjectSchema>;
export type UpdateUserSubjectInput = z.infer<typeof updateUserSubjectSchema>;