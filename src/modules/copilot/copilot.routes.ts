import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middlewares";
import { validateBody } from "../../middlewares/validate.middlewares";
import { copilotController } from "./copilot.controller";
import { copilotAskSchema } from "./copilot.validation";

const router = Router();

router.get("/pulse", requireAuth, copilotController.getPulse);
router.post("/ask", requireAuth, validateBody(copilotAskSchema), copilotController.ask);

export default router;
