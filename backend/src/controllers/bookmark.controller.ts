import { Request, Response } from "express";
import {
  addBookmark,
  removeBookmark,
  getStudentBookmarks,
} from "../services/bookmark.service";

export const addBookmarkController = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user!.id;
    const { internshipId } = req.params;

    const bookmark = await addBookmark(studentUserId, internshipId);

    return res.status(201).json({
      message: "Bookmark added successfully",
      bookmark,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to add bookmark" });
  }
};

export const removeBookmarkController = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user!.id;
    const { internshipId } = req.params;

    await removeBookmark(studentUserId, internshipId);

    return res.json({
      message: "Bookmark removed successfully",
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to remove bookmark" });
  }
};

export const getMyBookmarksController = async (req: Request, res: Response) => {
  try {
    const studentUserId = req.user!.id;
    const bookmarks = await getStudentBookmarks(studentUserId);

    return res.json({ bookmarks });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch bookmarks" });
  }
};
