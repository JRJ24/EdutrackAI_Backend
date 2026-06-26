import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createQuizziesSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  difficulty: z.string().trim().min(1),
  timeLimitMinutes: z.coerce.number().int().min(1).max(600),
  isActive: z.boolean().optional(),
});

export const updateQuizziesSchema = nonEmptyObject(
  createQuizziesSchema.partial().omit({ subjectId: true }),
);

export const submitAttemptAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid(),
});

export type CreateQuizziesInput = z.infer<typeof createQuizziesSchema>;
export type UpdateQuizziesInput = z.infer<typeof updateQuizziesSchema>;
export type SubmitAttemptAnswerInput = z.infer<typeof submitAttemptAnswerSchema>;