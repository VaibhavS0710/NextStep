import { Router } from "express";
import {
  applyToInternshipController,
  getMyApplicationsController,
  getCompanyInternshipApplicationsController,
  updateApplicationStatusController,
} from "../controllers/application.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  applyInternshipSchema,
  updateApplicationStatusSchema,
} from "../validators/application.validators";

const router = Router();

// Student applies to internship
router.post(
  "/:internshipId/apply",
  authMiddleware,
  requireRole("student"),
  validateBody(applyInternshipSchema),
  applyToInternshipController
);

// Student: view my applications
router.get(
  "/student/me",
  authMiddleware,
  requireRole("student"),
  getMyApplicationsController
);

// Company: view applicants for a specific internship
router.get(
  "/company/me/:internshipId",
  authMiddleware,
  requireRole("company"),
  getCompanyInternshipApplicationsController
);

// Company: update application status
router.patch(
  "/:applicationId/status",
  authMiddleware,
  requireRole("company"),
  validateBody(updateApplicationStatusSchema),
  updateApplicationStatusController
);

export default router;
