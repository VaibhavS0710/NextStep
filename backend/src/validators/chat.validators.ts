import Joi from "joi";

export const chatMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
  sessionId: Joi.string().optional(), // if you want to associate with existing session
});
