import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateParams } from "../../middlewares/validate.middlewares";
import { learningResourcesController } from "./learning-resources.controller";

const router = Router();

const subjectParamsSchema = z.object({
  subjectId: z.string().uuid(),
});

router.get(
  "/:subjectId",
  requireAuth,
  validateParams(subjectParamsSchema),
  learningResourcesController.discover,
);

export default router;
