import { Router } from "express";
import { z } from "zod";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { gradesController } from "./grades.controller";
import { createGradeSchema, updateGradeSchema } from "./grades.validation";

const subjectIdParamSchema = z.object({
  subjectId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, gradesController.getAll);
router.get("/by-subject/:subjectId", requireAuth, validateParams(subjectIdParamSchema), gradesController.getBySubject);
router.get("/:id", requireAuth, validateParams(idParamSchema), gradesController.getById);
router.post("/", requireAuth, validateBody(createGradeSchema), gradesController.create);
router.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateGradeSchema),
  gradesController.update,
);
router.delete("/:id", requireAuth, validateParams(idParamSchema), gradesController.remove);

export default router;