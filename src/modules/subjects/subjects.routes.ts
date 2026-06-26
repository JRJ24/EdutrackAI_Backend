import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { subjectsController } from "./subjects.controller";
import {
  assignUserToSubjectSchema,
  createSubjectSchema,
  updateSubjectSchema,
  updateUserSubjectSchema,
} from "./subjects.validation";

const subjectAndUserParamsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, subjectsController.getAll);
router.get("/:id", requireAuth, validateParams(idParamSchema), subjectsController.getById);
router.post("/", requireAuth, validateBody(createSubjectSchema), subjectsController.create);
router.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateSubjectSchema),
  subjectsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  subjectsController.remove,
);

router.get(
  "/:id/users",
  requireAuth,
  validateParams(idParamSchema),
  subjectsController.getUsersBySubject,
);
router.post(
  "/:id/users",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(assignUserToSubjectSchema),
  subjectsController.assignUser,
);
router.put(
  "/:id/users/:userId",
  requireAuth,
  validateParams(subjectAndUserParamsSchema),
  validateBody(updateUserSubjectSchema),
  subjectsController.updateUserAssignment,
);
router.delete(
  "/:id/users/:userId",
  requireAuth,
  validateParams(subjectAndUserParamsSchema),
  subjectsController.unassignUser,
);

export default router;