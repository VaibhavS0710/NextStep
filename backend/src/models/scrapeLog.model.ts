import mongoose, { Document, Schema } from "mongoose";

export type ScrapeLogLevel = "info" | "warning" | "error";

export interface IScrapeLog extends Document {
  jobId: mongoose.Types.ObjectId;
  level: ScrapeLogLevel;
  message: string;
  meta?: Record<string, any>;
  timestamp: Date;
}

const ScrapeLogSchema = new Schema<IScrapeLog>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "ScrapeJob",
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["info", "warning", "error"],
      default: "info",
    },
    message: { type: String, required: true },
    meta: { type: Object },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const ScrapeLog = mongoose.model<IScrapeLog>(
  "ScrapeLog",
  ScrapeLogSchema
);
