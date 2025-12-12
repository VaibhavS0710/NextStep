import Joi from "joi";

const apiConfigSchema = Joi.object({
  endpoint: Joi.string().uri().optional(),
  apiKeyEnvVar: Joi.string().optional(),
  extraParams: Joi.object().optional(),
});

export const createScrapeSourceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  baseUrl: Joi.string().uri().required(),
  listPath: Joi.string().optional(),
  selectors: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional(),
  enabled: Joi.boolean().optional(),
  frequencyMinutes: Joi.number().integer().min(5).optional(),
  providerType: Joi.string().valid("html", "api").default("html"),
  apiConfig: apiConfigSchema.optional(),
});

export const updateScrapeSourceSchema = createScrapeSourceSchema.fork(
  ["name", "baseUrl"],
  (schema) => schema.optional()
);
