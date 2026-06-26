import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { quizziesController } from "./quizzies.controller";
import {
  createQuizziesSchema,
  submitAttemptAnswerSchema,
  updateQuizziesSchema,
} from "./quizzies.validation";

const subjectIdParamSchema = z.object({
  subjectId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, quizziesController.getAll);
router.get("/me/attempts", requireAuth, quizziesController.getAttemptsByUser);
router.get(
  "/by-subject/:subjectId",
  requireAuth,
  validateParams(subjectIdParamSchema),
  quizziesController.getBySubject,
);
router.get("/:id", requireAuth, validateParams(idParamSchema), quizziesController.getById);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createQuizziesSchema),
  quizziesController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateQuizziesSchema),
  quizziesController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  quizziesController.remove,
);

router.post(
  "/:id/attempts",
  requireAuth,
  validateParams(idParamSchema),
  quizziesController.startAttempt,
);
router.get(
  "/attempts/:id",
  requireAuth,
  validateParams(idParamSchema),
  quizziesController.getAttemptById,
);
router.post(
  "/attempts/:id/answers",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(submitAttemptAnswerSchema),
  quizziesController.submitAttemptAnswer,
);
router.post(
  "/attempts/:id/finish",
  requireAuth,
  validateParams(idParamSchema),
  quizziesController.finishAttempt,
);

export default router;