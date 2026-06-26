import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middlewares";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

export default router;
