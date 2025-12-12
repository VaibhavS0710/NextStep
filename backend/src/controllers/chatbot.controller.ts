import { Request, Response } from "express";
import { handleStudentChatMessage } from "../services/chatbot.service";

export const studentChatController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message, sessionId } = req.body;

    const response = await handleStudentChatMessage(userId, message, sessionId);

    return res.json(response);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Failed to process chat message",
    });
  }
};
