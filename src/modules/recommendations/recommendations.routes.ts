import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { recommendationsController } from "./recommendations.controller";
import {
  createRecommendationSchema,
  updateRecommendationSchema,
} from "./recommendations.validation";

const router = Router();

router.get("/", requireAuth, recommendationsController.getAll);
router.get("/:id", requireAuth, validateParams(idParamSchema), recommendationsController.getById);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createRecommendationSchema),
  recommendationsController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateRecommendationSchema),
  recommendationsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  recommendationsController.remove,
);

export default router;