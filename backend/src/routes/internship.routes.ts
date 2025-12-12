

import { Router } from "express";


import { getAggregatedInternshipsController } from "../controllers/aggregatedInternship.controller";

import {
  listInternshipsController,
  getInternshipByIdController,
} from "../controllers/internship.controller";

const router = Router();

router.get("/aggregated/list", getAggregatedInternshipsController);
// Public routes
router.get("/", listInternshipsController);


router.get("/:id", getInternshipByIdController);



export default router;
