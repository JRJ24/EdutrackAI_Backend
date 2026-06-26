import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/summary", requireAuth, dashboardController.getSummary);
router.get("/performance", requireAuth, dashboardController.getPerformance);
router.get("/streak", requireAuth, dashboardController.getStreak);

export default router;