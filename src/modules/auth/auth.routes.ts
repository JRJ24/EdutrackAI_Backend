import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody } from "../../middlewares/validate.middlewares";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/resend-verification", requireAuth, authController.resendVerification);
router.get("/verify-email", authController.verifyEmail);

export default router;
