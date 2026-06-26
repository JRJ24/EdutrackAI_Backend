import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { studySessionsController } from "./study-sessions.controller";
import {
  createStudySessionSchema,
  updateStudySessionSchema,
} from "./study-sessions.validation";

const subjectIdParamSchema = z.object({
  subjectId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, studySessionsController.getAll);
router.get(
  "/by-subject/:subjectId",
  requireAuth,
  validateParams(subjectIdParamSchema),
  studySessionsController.getBySubject,
);
router.get("/:id", requireAuth, validateParams(idParamSchema), studySessionsController.getById);
router.post("/", requireAuth, validateBody(createStudySessionSchema), studySessionsController.create);
router.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateStudySessionSchema),
  studySessionsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  studySessionsController.remove,
);

export default router;