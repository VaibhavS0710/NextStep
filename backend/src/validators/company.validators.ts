import Joi from "joi";

export const updateCompanyProfileSchema = Joi.object({
  companyName: Joi.string().max(200).optional(),
  logoUrl: Joi.string().uri().optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().max(2000).optional(),
  size: Joi.string().max(100).optional(),
  location: Joi.string().max(200).optional(),
});
