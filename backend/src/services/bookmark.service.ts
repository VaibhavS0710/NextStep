import mongoose from "mongoose";
import { Bookmark } from "../models/bookmark.model";
import { Internship } from "../models/internship.model";

export const addBookmark = async (
  studentUserId: string,
  internshipId: string
) => {
  if (!mongoose.isValidObjectId(internshipId)) {
    throw new Error("Invalid internship id");
  }

  const internship = await Internship.findById(internshipId);
  if (!internship) {
    throw new Error("Internship not found");
  }

  const bookmark = await Bookmark.findOneAndUpdate(
    {
      studentId: new mongoose.Types.ObjectId(studentUserId),
      internshipId: internship._id,
    },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return bookmark;
};

export const removeBookmark = async (
  studentUserId: string,
  internshipId: string
) => {
  if (!mongoose.isValidObjectId(internshipId)) {
    throw new Error("Invalid internship id");
  }

  await Bookmark.findOneAndDelete({
    studentId: new mongoose.Types.ObjectId(studentUserId),
    internshipId: new mongoose.Types.ObjectId(internshipId),
  });
};

export const getStudentBookmarks = async (studentUserId: string) => {
  const bookmarks = await Bookmark.find({
    studentId: new mongoose.Types.ObjectId(studentUserId),
  })
    .sort({ createdAt: -1 })
    .populate("internshipId");

  return bookmarks;
};
