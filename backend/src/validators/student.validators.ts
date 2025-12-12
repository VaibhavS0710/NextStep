import Joi from "joi";

export const updateStudentProfileSchema = Joi.object({
  collegeName: Joi.string().max(200).optional(),
  degree: Joi.string().max(100).optional(),
  branch: Joi.string().max(100).optional(),
  graduationYear: Joi.number().integer().min(2000).max(2100).optional(),
  locationPreference: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  resumeUrl: Joi.string().uri().optional(),
  linkedInUrl: Joi.string().uri().optional(),
  githubUrl: Joi.string().uri().optional(),
  portfolioUrl: Joi.string().uri().optional(),
  about: Joi.string().max(1000).optional(),
});
