import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { adminController } from "./admin.controller";
import { activeToggleSchema } from "./admin.validation";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", adminController.listUsers);
router.patch(
  "/users/:id/active",
  validateParams(idParamSchema),
  validateBody(activeToggleSchema),
  adminController.setUserActive,
);
router.get("/stats", adminController.getStats);
router.get("/audit-logs", adminController.listAuditLogs);

export default router;