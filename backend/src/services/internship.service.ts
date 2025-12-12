import { Internship, IInternship } from "../models/internship.model";
import mongoose from "mongoose";

interface ListFilters {
  q?: string;
  location?: string;
  mode?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const listInternships = async (filters: ListFilters) => {
  const {
    q,
    location,
    mode,
    type,
    page = 1,
    limit = 10,
  } = filters;

  const query: any = { status: "open" };

  if (q) {
    const regex = new RegExp(q, "i");
    query.$or = [{ title: regex }, { description: regex }];
  }

  if (location) {
    query.location = new RegExp(location, "i");
  }

  if (mode) {
    query.mode = mode;
  }

  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Internship.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit),
    Internship.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getInternshipById = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Internship.findById(id);
};

