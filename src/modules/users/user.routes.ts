import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { userController } from "./user.controller";
import {
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
} from "./user.validation";

const router = Router();

router.get("/", requireAuth, userController.getAll);
router.get("/me", requireAuth, userController.getMe);
router.get("/:id", requireAuth, validateParams(idParamSchema), userController.getById);
router.post("/", requireAuth, validateBody(createUserSchema), userController.create);
router.put(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  userController.update,
);
router.delete("/:id", requireAuth, validateParams(idParamSchema), userController.remove);
router.patch(
  "/me/password",
  requireAuth,
  validateBody(changePasswordSchema),
  userController.changePassword,
);

export default router;