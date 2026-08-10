import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { adaptiveEngineController } from "./adaptive-engine.controller";

const router = Router();

router.get("/overview", requireAuth, adaptiveEngineController.getOverview);
router.get("/history", requireAuth, adaptiveEngineController.getHistory);
router.post("/recalculate", requireAuth, adaptiveEngineController.recalculate);
router.post(
  "/recalculate-all",
  requireAuth,
  requireRole("admin"),
  adaptiveEngineController.recalculateAll,
);

export default router;
