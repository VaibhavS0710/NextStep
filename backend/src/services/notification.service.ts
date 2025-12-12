import mongoose from "mongoose";
import { Notification, INotification } from "../models/notification.model";

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, any>
): Promise<INotification> => {
  const notification = await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    type,
    title,
    body,
    metadata,
  });

  return notification;
};

export const getUserNotifications = async (userId: string) => {
  const notifications = await Notification.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(50); // limit for now; later add pagination

  return notifications;
};

export const markNotificationRead = async (userId: string, id: string) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: { isRead: true } },
    { new: true }
  );
  return notification;
};

export const markAllNotificationsRead = async (userId: string) => {
  await Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
};
