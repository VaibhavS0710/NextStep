import { Router } from "express";
import {
  getAdminDashboardSummaryController,
  listUsersController,
  updateUserStatusController,
  listCompaniesController,
  verifyCompanyController,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  updateUserStatusSchema,
  verifyCompanySchema,
} from "../validators/admin.validators";

const router = Router();

// All admin routes: admin only
router.use(authMiddleware, requireRole("admin"));

router.get("/dashboard/summary", getAdminDashboardSummaryController);

router.get("/users", listUsersController);

router.patch(
  "/users/:userId/status",
  validateBody(updateUserStatusSchema),
  updateUserStatusController
);

router.get("/companies", listCompaniesController);

router.patch(
  "/companies/:userId/verify",
  validateBody(verifyCompanySchema),
  verifyCompanyController
);

export default router;
