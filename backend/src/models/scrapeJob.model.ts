import mongoose, { Document, Schema } from "mongoose";

export type ScrapeJobStatus = "queued" | "running" | "completed" | "failed";

export interface IScrapeJob extends Document {
  sourceId: mongoose.Types.ObjectId;
  status: ScrapeJobStatus;
  startedAt?: Date;
  finishedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScrapeJobSchema = new Schema<IScrapeJob>(
  {
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: "ScrapeSource",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
      index: true,
    },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const ScrapeJob = mongoose.model<IScrapeJob>(
  "ScrapeJob",
  ScrapeJobSchema
);
