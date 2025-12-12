import { Router } from "express";
import {
  getMyNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All notifications: any authenticated user
router.use(authMiddleware);

router.get("/me", getMyNotificationsController);
router.patch("/:id/read", markNotificationReadController);
router.patch("/mark-all/read", markAllNotificationsReadController);

export default router;
