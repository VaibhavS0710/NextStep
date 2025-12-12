import mongoose, { Document, Schema } from "mongoose";

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  collegeName?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  locationPreference?: string[];
  skills?: string[];
  resumeUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  about?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },
    collegeName: { type: String },
    degree: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    locationPreference: [{ type: String }],
    skills: [{ type: String }],
    resumeUrl: { type: String },
    linkedInUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    about: { type: String },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model<IStudentProfile>(
  "StudentProfile",
  StudentProfileSchema
);
