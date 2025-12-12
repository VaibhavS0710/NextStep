import { Router } from "express";
import { studentChatController } from "../controllers/chatbot.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { chatMessageSchema } from "../validators/chat.validators";

const router = Router();

// Student chatbot
router.post(
  "/student",
  authMiddleware,
  requireRole("student"),
  validateBody(chatMessageSchema),
  studentChatController
);

export default router;
