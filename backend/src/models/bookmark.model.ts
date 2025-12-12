import mongoose, { Document, Schema } from "mongoose";

export interface IBookmark extends Document {
  studentId: mongoose.Types.ObjectId;    // User with role "student"
  internshipId: mongoose.Types.ObjectId; // Internship
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    studentId: {
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate bookmarks
BookmarkSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>("Bookmark", BookmarkSchema);
