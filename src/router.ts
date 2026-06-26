import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import rolesRoutes from "./modules/roles/roles.routes";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/roles", rolesRoutes);

export default router;
