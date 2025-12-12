import { Router } from "express";
import {
  createScrapeSourceController,
  listScrapeSourcesController,
  updateScrapeSourceController,
  getScrapeSourceController,
  listScrapeJobsForSourceController,
  getScrapeLogsForJobController,
  triggerScrapeNowController,
  livePreviewScrapeController,
} from "../controllers/scraping.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createScrapeSourceSchema,
  updateScrapeSourceSchema,
} from "../validators/scraping.validators";

const router = Router();

// Admin only
router.use(authMiddleware, requireRole("admin"));

// Sources
router.get("/sources", listScrapeSourcesController);
router.post(
  "/sources",
  validateBody(createScrapeSourceSchema),
  createScrapeSourceController
);
router.get("/sources/:id", getScrapeSourceController);
router.put(
  "/sources/:id",
  validateBody(updateScrapeSourceSchema),
  updateScrapeSourceController
);

// Jobs
router.get("/sources/:id/jobs", listScrapeJobsForSourceController);
router.post("/sources/:id/run", triggerScrapeNowController);

// Logs
router.get("/jobs/:jobId/logs", getScrapeLogsForJobController);

// Live preview (no DB insert)
router.get("/sources/:id/live-preview", livePreviewScrapeController);

export default router;
