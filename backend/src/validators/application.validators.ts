import Joi from "joi";

export const applyInternshipSchema = Joi.object({
  resumeUrl: Joi.string().uri().optional(),
  coverLetter: Joi.string().max(2000).optional(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("applied", "shortlisted", "rejected", "hired")
    .required(),
});
