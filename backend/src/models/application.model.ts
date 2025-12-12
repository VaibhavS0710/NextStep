import mongoose, { Document, Schema } from "mongoose";

export type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "hired";

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId; // User (student)
  companyId: mongoose.Types.ObjectId; // User (company)
  internshipId: mongoose.Types.ObjectId;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    internshipId: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
      index: true,
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicates: same student applying multiple times to same internship
ApplicationSchema.index(
  { studentId: 1, internshipId: 1 },
  { unique: true }
);

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);
