import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { studentInputsController } from "./student-inputs.controller";
import {
  createStudentInputSchema,
  updateStudentInputSchema,
} from "./student-inputs.validation";

const router = Router();

router.get("/", requireAuth, studentInputsController.list);
router.post(
  "/",
  requireAuth,
  validateBody(createStudentInputSchema),
  studentInputsController.create,
);
router.patch(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateStudentInputSchema),
  studentInputsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  studentInputsController.remove,
);

export default router;
