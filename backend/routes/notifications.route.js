import express from "express";
import {
  getAllNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  deleteAllNotifications,
  createNotification,
  getNotificationStats,
  bulkMarkAsRead,
  bulkDeleteNotifications,
} from "../controllers/notifications.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const notificationRoute = express.Router();

notificationRoute.use(authMiddleware);

notificationRoute.get("/", getAllNotifications);

notificationRoute.get("/stats", getNotificationStats);

notificationRoute.get("/unread/count", getUnreadCount);

notificationRoute.get("/:id", getNotificationById);

notificationRoute.post("/", createNotification);

notificationRoute.patch("/read-all", markAllAsRead);

notificationRoute.patch("/bulk/read", bulkMarkAsRead);

notificationRoute.patch("/:id/read", markAsRead);

notificationRoute.patch("/:id/unread", markAsUnread);

notificationRoute.delete("/all", deleteAllNotifications);

notificationRoute.delete("/read", deleteAllRead);

notificationRoute.delete("/bulk", bulkDeleteNotifications);

notificationRoute.delete("/:id", deleteNotification);

export default notificationRoute;
