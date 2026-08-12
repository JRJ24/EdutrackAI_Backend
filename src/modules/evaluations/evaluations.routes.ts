import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { evaluationsController } from "./evaluations.controller";
import { createEvaluationSchema, updateEvaluationSchema } from "./evaluations.validation";

const router = Router();

router.get("/", requireAuth, evaluationsController.getAll);
router.get("/upcoming", requireAuth, evaluationsController.getUpcoming);
router.get("/:id", requireAuth, validateParams(idParamSchema), evaluationsController.getById);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createEvaluationSchema),
  evaluationsController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateEvaluationSchema),
  evaluationsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  evaluationsController.remove,
);

export default router;
