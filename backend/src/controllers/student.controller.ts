import { Request, Response } from "express";
import {
  getOrCreateStudentProfile,
  updateStudentProfile,
} from "../services/student.service";

export const getMyStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await getOrCreateStudentProfile(userId);
    return res.json({ profile });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch student profile" });
  }
};

export const updateMyStudentProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await updateStudentProfile(userId, req.body);
    return res.json({
      message: "Student profile updated successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to update student profile" });
  }
};
