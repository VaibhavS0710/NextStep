import mongoose from "mongoose";
import { ScrapeJob } from "../models/scrapeJob.model";
import { ScrapeSource } from "../models/scrapeSource.model";
import { ScrapeLog } from "../models/scrapeLog.model";
import { Internship } from "../models/internship.model";
import { scrapeSourceHtml } from "../utils/htmlScraper.util";

export const runScrapeJob = async (jobId: string) => {
  if (!mongoose.isValidObjectId(jobId)) {
    console.error("Invalid job id passed to runScrapeJob");
    return;
  }

  const job = await ScrapeJob.findById(jobId);
  if (!job) {
    console.error("Scrape job not found:", jobId);
    return;
  }

  try {
    job.status = "running";
    job.startedAt = new Date();
    await job.save();

    const source = await ScrapeSource.findById(job.sourceId);
    if (!source) {
      throw new Error("Scrape source not found");
    }

    await ScrapeLog.create({
      jobId: job._id,
      level: "info",
      message: `Started scraping for source: ${source.name}`,
      meta: { sourceId: source._id.toString() },
      timestamp: new Date(),
    });

    // Real HTML scraping
    const scrapedList = await scrapeSourceHtml(source);
    const now = new Date();

    const docs = scrapedList.map((item) => ({
      title: item.title,
      description: item.description,
      location: item.location || "Not specified",
      mode: "remote" as const,
      type: "internship" as const,
      durationInMonths: 3,
      skills: [],
      createdBy: new mongoose.Types.ObjectId(), // generic system/company user
      source: "scraped" as const,
      postedAt: now,
      status: "open" as const,
      needsReview: true,
      externalApplyUrl: item.applyUrl,
    }));

    if (docs.length > 0) {
      await Internship.insertMany(docs);
    }

    await ScrapeLog.create({
      jobId: job._id,
      level: "info",
      message: `Inserted ${docs.length} internships from ${source.name}`,
      meta: { count: docs.length },
      timestamp: new Date(),
    });

    source.lastRunAt = new Date();
    await source.save();

    job.status = "completed";
    job.finishedAt = new Date();
    await job.save();

    await ScrapeLog.create({
      jobId: job._id,
      level: "info",
      message: "Scrape job completed",
      timestamp: new Date(),
    });
  } catch (err: any) {
    console.error("Scrape job failed:", err);
    job.status = "failed";
    job.finishedAt = new Date();
    job.errorMessage = err.message;
    await job.save();

    await ScrapeLog.create({
      jobId: job._id,
      level: "error",
      message: "Scrape job failed",
      meta: { error: err.message },
      timestamp: new Date(),
    });
  }
};
