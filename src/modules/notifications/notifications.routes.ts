import { Router } from "express";
import { idParamSchema } from "../../helpers/validations";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { notificationsController } from "./notifications.controller";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "./notifications.validation";

const router = Router();

router.get("/", requireAuth, notificationsController.getAll);
router.post(
  "/mark-all-read",
  requireAuth,
  notificationsController.markAllAsRead,
);
router.get(
  "/:id",
  requireAuth,
  validateParams(idParamSchema),
  notificationsController.getById,
);
router.patch(
  "/:id/read",
  requireAuth,
  validateParams(idParamSchema),
  notificationsController.markAsRead,
);
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validateBody(createNotificationSchema),
  notificationsController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  validateBody(updateNotificationSchema),
  notificationsController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validateParams(idParamSchema),
  notificationsController.remove,
);

export default router;