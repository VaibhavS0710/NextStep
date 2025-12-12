import mongoose, { Document, Schema } from "mongoose";

export type ScrapeProviderType = "html" | "api";

export interface IScrapeSource extends Document {
  name: string;
  baseUrl: string;
  listPath?: string;
  selectors?: Record<string, string>;
  enabled: boolean;
  frequencyMinutes?: number;
  lastRunAt?: Date;
  providerType: ScrapeProviderType;
  apiConfig?: {
    endpoint?: string;
    apiKeyEnvVar?: string; // name of env var, e.g. "LINKEDIN_API_KEY"
    extraParams?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScrapeSourceSchema = new Schema<IScrapeSource>(
  {
    name: { type: String, required: true, unique: true },
    baseUrl: { type: String, required: true },
    listPath: { type: String },
    selectors: { type: Object },
    enabled: { type: Boolean, default: true },
    frequencyMinutes: { type: Number, default: 1440 },
    lastRunAt: { type: Date },
    providerType: {
      type: String,
      enum: ["html", "api"],
      default: "html",
      index: true,
    },
    apiConfig: { type: Object },
  },
  { timestamps: true }
);

export const ScrapeSource = mongoose.model<IScrapeSource>(
  "ScrapeSource",
  ScrapeSourceSchema
);
