import { Request, Response } from "express";
import {
  createInternship,
  listInternships,
  getInternshipById,
  getCompanyInternships,
  updateInternship,
  updateInternshipStatus,
} from "../services/internship.service";

export const createInternshipController = async (req: Request, res: Response) => {
  try {
    const companyUserId = req.user!.id;
    const internship = await createInternship(companyUserId, req.body);
    return res.status(201).json({
      message: "Internship created successfully",
      internship,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to create internship" });
  }
};

export const listInternshipsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { q, location, mode, type, page, limit } = req.query;

    const result = await listInternships({
      q: q as string | undefined,
      location: location as string | undefined,
      mode: mode as string | undefined,
      type: type as string | undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to list internships" });
  }
};

export const getInternshipByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const internship = await getInternshipById(id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    return res.json({ internship });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch internship" });
  }
};

export const getMyCompanyInternshipsController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyUserId = req.user!.id;
    const { page, limit } = req.query;

    const result = await getCompanyInternships(
      companyUserId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10
    );

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch company internships" });
  }
};

export const updateInternshipController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyUserId = req.user!.id;
    const { id } = req.params;

    const updated = await updateInternship(companyUserId, id, req.body);
    if (!updated) {
      return res.status(404).json({
        message: "Internship not found or you are not the owner",
      });
    }

    return res.json({
      message: "Internship updated successfully",
      internship: updated,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to update internship" });
  }
};

export const updateInternshipStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyUserId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const updated = await updateInternshipStatus(companyUserId, id, status);
    if (!updated) {
      return res.status(404).json({
        message: "Internship not found or you are not the owner",
      });
    }

    return res.json({
      message: "Internship status updated successfully",
      internship: updated,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to update internship status" });
  }
};
