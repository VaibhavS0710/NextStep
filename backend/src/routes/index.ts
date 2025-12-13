import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import internshipRoutes from "./internship.routes";
import applicationRoutes from "./application.routes";
import bookmarkRoutes from "./bookmark.routes";
import notificationRoutes from "./notification.routes";
import adminRoutes from "./admin.routes";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import scrapingRoutes from "./scraping.routes";
import chatRoutes from "./chat.routes";


const router = Router();

// Public root
router.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to NextStep API",
  });
});

// Chatbot
router.use("/chat", chatRoutes);

// Admin scraping
router.use("/admin/scraping", scrapingRoutes);

// Auth
router.use("/auth", authRoutes);

// Profiles
router.use("/students", studentRoutes);

// Internships & applications
router.use("/internships", internshipRoutes);
router.use("/applications", applicationRoutes);

// Bookmarks (students)
router.use("/bookmarks", bookmarkRoutes);

// Notifications (all authenticated users)
router.use("/notifications", notificationRoutes);

// Admin
router.use("/admin", adminRoutes);

// Simple test routes (optional)
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  return res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

router.get(
  "/admin-only",
  authMiddleware,
  requireRole("admin"),
  (req: Request, res: Response) => {
    return res.json({
      message: "Welcome admin",
      user: req.user,
    });
  }
);

export default router;
