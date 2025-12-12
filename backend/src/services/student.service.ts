import { StudentProfile, IStudentProfile } from "../models/studentProfile.model";
import mongoose from "mongoose";

export const getOrCreateStudentProfile = async (
  userId: string
): Promise<IStudentProfile> => {
  const uid = new mongoose.Types.ObjectId(userId);

  let profile = await StudentProfile.findOne({ userId: uid });
  if (!profile) {
    profile = await StudentProfile.create({ userId: uid });
  }
  return profile;
};

interface UpdateStudentProfileInput {
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
}

export const updateStudentProfile = async (
  userId: string,
  data: UpdateStudentProfileInput
): Promise<IStudentProfile | null> => {
  const uid = new mongoose.Types.ObjectId(userId);

  const profile = await StudentProfile.findOneAndUpdate(
    { userId: uid },
    { $set: data },
    { new: true, upsert: true }
  );

  return profile;
};
