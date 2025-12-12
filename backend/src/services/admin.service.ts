import { User } from "../models/user.model";
import { Internship } from "../models/internship.model";
import { Application } from "../models/application.model";
import { CompanyProfile } from "../models/companyProfile.model";
import mongoose from "mongoose";

export const getDashboardSummary = async () => {
  const [totalUsers, totalStudents, totalCompanies, totalInternships, totalApplications, openInternships] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "company" }),
      Internship.countDocuments({}),
      Application.countDocuments({}),
      Internship.countDocuments({ status: "open" }),
    ]);

  return {
    totalUsers,
    totalStudents,
    totalCompanies,
    totalInternships,
    totalApplications,
    openInternships,
  };
};

export const listUsers = async (
  role?: string,
  status?: string,
  page = 1,
  limit = 20
) => {
  const query: any = {};

  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateUserStatus = async (
  userId: string,
  status: "active" | "suspended"
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user id");
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { status } },
    { new: true }
  );

  if (!updated) {
    throw new Error("User not found");
  }

  return updated;
};

export const listCompaniesWithProfiles = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Get company users
  const [users, total] = await Promise.all([
    User.find({ role: "company" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ role: "company" }),
  ]);

  // Attach profile info
  const userIds = users.map((u) => u._id);
  const profiles = await CompanyProfile.find({
    userId: { $in: userIds },
  });

  const profileMap = new Map(
    profiles.map((p) => [p.userId.toString(), p])
  );

  const items = users.map((user) => ({
    user,
    profile: profileMap.get(user._id.toString()) || null,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const verifyCompany = async (userId: string, isVerified: boolean) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user id");
  }

  const profile = await CompanyProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: { isVerified } },
    { new: true }
  );

  if (!profile) {
    throw new Error("Company profile not found");
  }

  return profile;
};
