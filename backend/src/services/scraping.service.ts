import mongoose from "mongoose";
import { ScrapeSource } from "../models/scrapeSource.model";
import { ScrapeJob } from "../models/scrapeJob.model";
import { ScrapeLog } from "../models/scrapeLog.model";
import { runScrapeJob } from "../jobs/scraping.job";
import { scrapeSourceHtml } from "../utils/htmlScraper.util";

interface CreateSourceInput {
  name: string;
  baseUrl: string;
  listPath?: string;
  selectors?: Record<string, string>;
  enabled?: boolean;
  frequencyMinutes?: number;
  providerType?: "html" | "api";
  apiConfig?: {
    endpoint?: string;
    apiKeyEnvVar?: string;
    extraParams?: Record<string, any>;
  };
}

interface UpdateSourceInput extends Partial<CreateSourceInput> {}

export const createScrapeSource = async (data: CreateSourceInput) => {
  const source = await ScrapeSource.create(data);
  return source;
};

export const listScrapeSources = async () => {
  const sources = await ScrapeSource.find().sort({ createdAt: -1 });
  return sources;
};

export const updateScrapeSource = async (id: string, data: UpdateSourceInput) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid source id");
  }

  const updated = await ScrapeSource.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );

  if (!updated) {
    throw new Error("Scrape source not found");
  }

  return updated;
};

export const getScrapeSourceById = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return ScrapeSource.findById(id);
};

export const listScrapeJobsForSource = async (sourceId: string) => {
  if (!mongoose.isValidObjectId(sourceId)) {
    throw new Error("Invalid source id");
  }

  const jobs = await ScrapeJob.find({
    sourceId: new mongoose.Types.ObjectId(sourceId),
  })
    .sort({ createdAt: -1 })
    .limit(20);

  return jobs;
};

export const getScrapeLogsForJob = async (jobId: string) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw new Error("Invalid job id");
  }

  const logs = await ScrapeLog.find({
    jobId: new mongoose.Types.ObjectId(jobId),
  }).sort({ timestamp: 1 });

  return logs;
};

export const triggerScrapeNow = async (sourceId: string) => {
  if (!mongoose.isValidObjectId(sourceId)) {
    throw new Error("Invalid source id");
  }

  const source = await ScrapeSource.findById(sourceId);
  if (!source) {
    throw new Error("Scrape source not found");
  }

  const job = await ScrapeJob.create({
    sourceId: source._id,
    status: "queued",
  });

  // Run in-process for now
  runScrapeJob(job._id.toString());

  return job;
};

// Real-time (no DB insert) HTML scrape
export const livePreviewScrape = async (sourceId: string) => {
  if (!mongoose.isValidObjectId(sourceId)) {
    throw new Error("Invalid source id");
  }

  const source = await ScrapeSource.findById(sourceId);
  if (!source) {
    throw new Error("Scrape source not found");
  }

  const items = await scrapeSourceHtml(source);
  return items;
};
