import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { resourcesController } from "./resource.controller";
import { createResourceSchema, updateResourceSchema } from "./resource.validation";

const subjectIdParamSchema = z.object({
  subjectId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, resourcesController.getAll);
router.get(
  "/by-subject/:subjectId",
  requireAuth,
  validateParams(subjectIdParamSchema),
  resourcesController.getBySubject,
);
router.get("/:id", requireAuth, validateParams(idParamSchema), resourcesController.getById);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createResourceSchema),
  resourcesController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateResourceSchema),
  resourcesController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  resourcesController.remove,
);

export default router;