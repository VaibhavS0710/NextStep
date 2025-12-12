import Joi from "joi";

export const createInternshipSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  responsibilities: Joi.string().optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  stipend: Joi.number().min(0).optional(),
  salary: Joi.number().min(0).optional(),
  currency: Joi.string().max(10).optional(),
  location: Joi.string().max(200).required(),
  mode: Joi.string().valid("remote", "onsite", "hybrid").required(),
  type: Joi.string().valid("internship", "fulltime").required(),
  durationInMonths: Joi.number().integer().min(0).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  externalApplyUrl: Joi.string().uri().optional(),
  applyDeadline: Joi.date().optional(),
  status: Joi.string().valid("open", "closed", "draft").optional(), // optional, defaults to open
});

export const updateInternshipSchema = createInternshipSchema.fork(
  [
    "title",
    "description",
    "location",
    "mode",
    "type"
  ],
  (schema) => schema.optional()
);

export const updateInternshipStatusSchema = Joi.object({
  status: Joi.string().valid("open", "closed", "draft").required(),
});
