import { Router } from "express";
import {
  addBookmarkController,
  removeBookmarkController,
  getMyBookmarksController,
} from "../controllers/bookmark.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// All bookmark routes: student only
router.use(authMiddleware, requireRole("student"));

router.get("/me", getMyBookmarksController);
router.post("/:internshipId", addBookmarkController);
router.delete("/:internshipId", removeBookmarkController);

export default router;
