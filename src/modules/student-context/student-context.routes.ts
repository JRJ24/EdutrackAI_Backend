import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middlewares/auth.middlewares";
import { validateBody, validateParams } from "../../middlewares/validate.middlewares";
import { studentContextController } from "./student-context.controller";
import {
  applyCatalogSchema,
  customContextSchema,
  customSubjectSchema,
  updateMySubjectSchema,
} from "./student-context.validation";

const router = Router();

const programParamsSchema = z.object({
  institutionKey: z.string().min(1),
  programKey: z.string().min(1),
});

const assignmentParamsSchema = z.object({
  assignmentId: z.string().uuid(),
});

// Public, read-only curriculum data is used by registration before a session exists.
router.get("/catalog", studentContextController.getCatalog);
router.get(
  "/catalog/:institutionKey/:programKey",
  validateParams(programParamsSchema),
  studentContextController.getProgram,
);
router.post(
  "/catalog/sync",
  requireAuth,
  requireRole("admin"),
  studentContextController.syncCatalogSubjects,
);

router.get("/me", requireAuth, studentContextController.getMe);
router.post(
  "/apply",
  requireAuth,
  validateBody(applyCatalogSchema),
  studentContextController.applyCatalog,
);
router.post(
  "/custom",
  requireAuth,
  validateBody(customContextSchema),
  studentContextController.saveCustomContext,
);
router.post(
  "/subjects/custom",
  requireAuth,
  validateBody(customSubjectSchema),
  studentContextController.addCustomSubject,
);
router.patch(
  "/subjects/:assignmentId",
  requireAuth,
  validateParams(assignmentParamsSchema),
  validateBody(updateMySubjectSchema),
  studentContextController.updateMySubject,
);
router.delete(
  "/subjects/:assignmentId",
  requireAuth,
  validateParams(assignmentParamsSchema),
  studentContextController.removeMySubject,
);

export default router;
