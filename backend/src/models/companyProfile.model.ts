import mongoose, { Document, Schema } from "mongoose";

export interface ICompanyProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  size?: string;
  location?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },
    companyName: { type: String },
    logoUrl: { type: String },
    website: { type: String },
    description: { type: String },
    size: { type: String },
    location: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const CompanyProfile = mongoose.model<ICompanyProfile>(
  "CompanyProfile",
  CompanyProfileSchema
);
