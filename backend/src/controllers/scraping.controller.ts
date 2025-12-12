import { Request, Response } from "express";
import {
  createScrapeSource,
  listScrapeSources,
  updateScrapeSource,
  getScrapeSourceById,
  listScrapeJobsForSource,
  getScrapeLogsForJob,
  triggerScrapeNow,
  livePreviewScrape,
} from "../services/scraping.service";

export const createScrapeSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const source = await createScrapeSource(req.body);
    return res.status(201).json({
      message: "Scrape source created successfully",
      source,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to create scrape source" });
  }
};

export const listScrapeSourcesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const sources = await listScrapeSources();
    return res.json({ sources });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to list scrape sources" });
  }
};

export const updateScrapeSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const source = await updateScrapeSource(id, req.body);
    return res.json({
      message: "Scrape source updated successfully",
      source,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to update scrape source" });
  }
};

export const getScrapeSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const source = await getScrapeSourceById(id);
    if (!source) {
      return res.status(404).json({ message: "Scrape source not found" });
    }
    return res.json({ source });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch scrape source" });
  }
};

export const listScrapeJobsForSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const jobs = await listScrapeJobsForSource(id);
    return res.json({ jobs });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch scrape jobs" });
  }
};

export const getScrapeLogsForJobController = async (
  req: Request,
  res: Response
) => {
  try {
    const { jobId } = req.params;
    const logs = await getScrapeLogsForJob(jobId);
    return res.json({ logs });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch scrape logs" });
  }
};

export const triggerScrapeNowController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const job = await triggerScrapeNow(id);
    return res.status(202).json({
      message: "Scrape job queued (running in background)",
      job,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to trigger scrape job" });
  }
};

export const livePreviewScrapeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const items = await livePreviewScrape(id);
    return res.json({ items });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to run live preview scrape" });
  }
};
