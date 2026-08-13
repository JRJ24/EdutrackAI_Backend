import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { studyPlanController } from "./study-plan.controller";
import { updateStudyPlanActivitySchema } from "./study-plan.validation";

const router = Router();

router.get("/", requireAuth, studyPlanController.getMyPlan);
router.post("/regenerate", requireAuth, studyPlanController.regenerate);
router.get("/:id", requireAuth, validateParams(idParamSchema), studyPlanController.getById);
router.patch(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateStudyPlanActivitySchema),
  studyPlanController.update,
);

export default router;
