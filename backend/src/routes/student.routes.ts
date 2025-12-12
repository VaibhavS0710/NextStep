import { Router } from "express";
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from "../controllers/student.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { updateStudentProfileSchema } from "../validators/student.validators";

const router = Router();

// All routes here require auth + student role
router.use(authMiddleware, requireRole("student"));

router.get("/me", getMyStudentProfile);

router.put(
  "/me",
  validateBody(updateStudentProfileSchema),
  updateMyStudentProfile
);

export default router;
