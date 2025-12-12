import { Application, IApplication } from "../models/application.model";
import { Internship } from "../models/internship.model";
import mongoose from "mongoose";
import { createNotification } from "./notification.service";

interface ApplyInput {
  resumeUrl?: string;
  coverLetter?: string;
}

export const applyToInternship = async (
  studentUserId: string,
  internshipId: string,
  data: ApplyInput
): Promise<IApplication> => {
  if (!mongoose.isValidObjectId(internshipId)) {
    throw new Error("Invalid internship id");
  }

  const internship = await Internship.findById(internshipId);
  if (!internship) throw new Error("Internship not found");
  if (internship.status !== "open") {
    throw new Error("Internship is not open for applications");
  }

  const studentId = new mongoose.Types.ObjectId(studentUserId);
  const companyId = internship.createdBy;

  const application = await Application.create({
    studentId,
    companyId,
    internshipId: internship._id,
    resumeUrl: data.resumeUrl,
    coverLetter: data.coverLetter,
    status: "applied",
    appliedAt: new Date(),
  });

  return application;
};

export const getStudentApplications = async (studentUserId: string) => {
  const studentId = new mongoose.Types.ObjectId(studentUserId);
  const applications = await Application.find({ studentId })
    .sort({ appliedAt: -1 })
    .populate("internshipId");
  return applications;
};

export const getCompanyInternshipApplications = async (
  companyUserId: string,
  internshipId: string
) => {
  if (!mongoose.isValidObjectId(internshipId)) {
    throw new Error("Invalid internship id");
  }

  const internship = await Internship.findById(internshipId);
  if (!internship) throw new Error("Internship not found");

  if (internship.createdBy.toString() !== companyUserId.toString()) {
    throw new Error("You are not the owner of this internship");
  }

  const applications = await Application.find({
    internshipId: internship._id,
  })
    .sort({ appliedAt: -1 })
    .populate("studentId");

  return applications;
};

export const updateApplicationStatus = async (
  companyUserId: string,
  applicationId: string,
  status: "applied" | "shortlisted" | "rejected" | "hired"
) => {
  if (!mongoose.isValidObjectId(applicationId)) {
    throw new Error("Invalid application id");
  }

  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Application not found");

  // Verify this company owns the internship
  const internship = await Internship.findById(application.internshipId);
  if (!internship) throw new Error("Internship not found");

  if (internship.createdBy.toString() !== companyUserId.toString()) {
    throw new Error("You are not allowed to modify this application");
  }

  application.status = status;
  await application.save();

    // Notify student
  await createNotification(
    application.studentId.toString(),
    "application_status_update",
    "Your application status was updated",
    `Your application for internship ${application.internshipId.toString()} is now: ${status}`,
    {
      applicationId: application._id.toString(),
      internshipId: application.internshipId.toString(),
      status,
    }
  );


  return application;
};
