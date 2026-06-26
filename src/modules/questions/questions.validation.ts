import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createQuestionSchema = z.object({
  quizId: z.string().uuid(),
  questionText: z.string().trim().min(1),
  questionType: z.string().trim().min(1),
  points: z.coerce.number().int().min(1).max(100),
  topic: z.string().trim().min(1),
  difficulty: z.string().trim().min(1),
});

export const updateQuestionSchema = nonEmptyObject(
  createQuestionSchema.partial().omit({ quizId: true }),
);

export const createQuestionOptionSchema = z.object({
  questionId: z.string().uuid(),
  optionText: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

export const updateQuestionOptionSchema = nonEmptyObject(
  createQuestionOptionSchema.partial().omit({ questionId: true }),
);

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type CreateQuestionOptionInput = z.infer<typeof createQuestionOptionSchema>;
export type UpdateQuestionOptionInput = z.infer<typeof updateQuestionOptionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;