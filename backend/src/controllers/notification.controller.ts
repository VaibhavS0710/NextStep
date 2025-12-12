import { Request, Response } from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service";

export const getMyNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const notifications = await getUserNotifications(userId);

    return res.json({ notifications });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Failed to fetch notifications",
    });
  }
};

export const markNotificationReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await markNotificationRead(userId, id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to mark notification as read",
    });
  }
};

export const markAllNotificationsReadController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    await markAllNotificationsRead(userId);

    return res.json({
      message: "All notifications marked as read",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Failed to mark all notifications as read",
    });
  }
};
