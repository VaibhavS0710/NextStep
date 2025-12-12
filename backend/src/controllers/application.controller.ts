import { Request, Response } from "express";
import {
  applyToInternship,
  getStudentApplications,
  getCompanyInternshipApplications,
  updateApplicationStatus,
} from "../services/application.service";

export const applyToInternshipController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentUserId = req.user!.id;
    const { internshipId } = req.params;

    const application = await applyToInternship(
      studentUserId,
      internshipId,
      req.body
    );

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to apply for internship" });
  }
};

export const getMyApplicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const studentUserId = req.user!.id;
    const applications = await getStudentApplications(studentUserId);

    return res.json({ applications });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Failed to fetch applications" });
  }
};

export const getCompanyInternshipApplicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyUserId = req.user!.id;
    const { internshipId } = req.params;

    const applications = await getCompanyInternshipApplications(
      companyUserId,
      internshipId
    );

    return res.json({ applications });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to fetch applications" });
  }
};

export const updateApplicationStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyUserId = req.user!.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    const updated = await updateApplicationStatus(
      companyUserId,
      applicationId,
      status
    );

    return res.json({
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (err: any) {
    console.error(err);
    return res
      .status(400)
      .json({ message: err.message || "Failed to update application status" });
  }
};
