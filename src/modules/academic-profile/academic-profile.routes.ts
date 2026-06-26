import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { z } from "zod";
import { academicProfileController } from "./academic-profile.controller";
import {
  createAcademicProfileSchema,
  updateAcademicProfileSchema,
} from "./academic-profile.validation";

const userIdParamSchema = z.object({
  userId: z.string().uuid(),
});

const router = Router();

router.get("/", requireAuth, academicProfileController.getAll);
router.get(
  "/by-user/:userId",
  requireAuth,
  validateParams(userIdParamSchema),
  academicProfileController.getByUser,
);
router.get(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  academicProfileController.getById,
);
router.post(
  "/",
  requireAuth,
  validateBody(createAcademicProfileSchema),
  academicProfileController.create,
);
router.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateAcademicProfileSchema),
  academicProfileController.update,
);
router.delete(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  academicProfileController.remove,
);

export default router;