import mongoose, { Document, Schema } from "mongoose";

export type InternshipMode = "remote" | "onsite" | "hybrid";
export type InternshipType = "internship" | "fulltime";
export type InternshipStatus = "open" | "closed" | "draft";
export type InternshipSource = "manual" | "scraped";

export interface IInternship extends Document {
  title: string;
  description: string;
  responsibilities?: string;
  requirements?: string[];
  stipend?: number;
  salary?: number;
  currency?: string;
  location: string;
  mode: InternshipMode;
  type: InternshipType;
  durationInMonths?: number;
  skills?: string[];
  createdBy?: mongoose.Types.ObjectId | null;   // ⬅️ now optional
  source: InternshipSource;
  externalApplyUrl?: string;
  postedAt: Date;
  applyDeadline?: Date;
  status: InternshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    responsibilities: { type: String },
    requirements: [{ type: String }],

    stipend: { type: Number },
    salary: { type: Number },
    currency: { type: String, default: "INR" },

    location: { type: String, required: true, index: true },

    mode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["internship", "fulltime"],
      required: true,
      index: true,
    },

    durationInMonths: { type: Number },
    skills: [{ type: String, index: true }],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "scraped"],
      default: "manual",
      index: true,
    },

    externalApplyUrl: { type: String },

    postedAt: { type: Date, default: Date.now },
    applyDeadline: { type: Date },

    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

export const Internship = mongoose.model<IInternship>(
  "Internship",
  InternshipSchema
);
