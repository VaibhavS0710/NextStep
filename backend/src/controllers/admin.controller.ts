import { Request, Response } from "express";
import {
  getDashboardSummary,
  listUsers,
  updateUserStatus,
  listCompaniesWithProfiles,
  verifyCompany,
} from "../services/admin.service";

export const getAdminDashboardSummaryController = async (
  _req: Request,
  res: Response
) => {
  try {
    const summary = await getDashboardSummary();
    return res.json({ summary });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Failed to fetch admin dashboard summary",
    });
  }
};

export const listUsersController = async (req: Request, res: Response) => {
  try {
    const { role, status, page, limit } = req.query;

    const result = await listUsers(
      role as string | undefined,
      status as string | undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to list users",
    });
  }
};

export const updateUserStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const updated = await updateUserStatus(userId, status);

    return res.json({
      message: "User status updated successfully",
      user: updated,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to update user status",
    });
  }
};

export const listCompaniesController = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const result = await listCompaniesWithProfiles(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );

    return res.json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to list companies",
    });
  }
};

export const verifyCompanyController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const profile = await verifyCompany(userId, isVerified);

    return res.json({
      message: "Company verification updated successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to update company verification",
    });
  }
};
