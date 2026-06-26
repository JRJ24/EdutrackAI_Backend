import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { questionsController } from "./questions.controller";
import {
  createQuestionOptionSchema,
  createQuestionSchema,
  updateQuestionOptionSchema,
  updateQuestionSchema,
} from "./questions.validation";

const quizIdParamSchema = z.object({
  quizId: z.string().uuid(),
});

const questionIdParamSchema = z.object({
  questionId: z.string().uuid(),
});

const router = Router();

router.get(
  "/by-quiz/:quizId",
  requireAuth,
  validateParams(quizIdParamSchema),
  questionsController.getQuestionsByQuiz,
);
router.get("/:id", requireAuth, validateParams(idParamSchema), questionsController.getQuestionById);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createQuestionSchema),
  questionsController.createQuestion,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateQuestionSchema),
  questionsController.updateQuestion,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  questionsController.removeQuestion,
);

router.get(
  "/:questionId/options",
  requireAuth,
  validateParams(questionIdParamSchema),
  questionsController.getOptionsByQuestion,
);
router.post(
  "/:questionId/options",
  requireAuth,
  requireRole("admin"),
  validateParams(questionIdParamSchema),
  validateBody(createQuestionOptionSchema),
  questionsController.createOption,
);
router.put(
  "/options/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateQuestionOptionSchema),
  questionsController.updateOption,
);
router.delete(
  "/options/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  questionsController.removeOption,
);

export default router;