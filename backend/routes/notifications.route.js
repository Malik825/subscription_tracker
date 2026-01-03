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

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================
notificationRoute.use(authMiddleware);

// ============================================
// GET ROUTES
// ============================================

// Get all notifications (with filters and pagination)
// GET /api/v1/notifications?read=true&type=renewal&limit=20&page=1
notificationRoute.get("/", getAllNotifications);

// Get notification statistics
// GET /api/v1/notifications/stats
notificationRoute.get("/stats", getNotificationStats);

// Get unread count (for badge)
// GET /api/v1/notifications/unread/count
notificationRoute.get("/unread/count", getUnreadCount);

// Get single notification by ID
// GET /api/v1/notifications/:id
notificationRoute.get("/:id", getNotificationById);

// ============================================
// POST ROUTES
// ============================================

// Create notification (manual - for testing)
// POST /api/v1/notifications
notificationRoute.post("/", createNotification);

// ============================================
// PATCH/PUT ROUTES
// ============================================

// Mark all notifications as read
// PATCH /api/v1/notifications/read-all
notificationRoute.patch("/read-all", markAllAsRead);

// Bulk mark notifications as read
// PATCH /api/v1/notifications/bulk/read
// Body: { notificationIds: ["id1", "id2", ...] }
notificationRoute.patch("/bulk/read", bulkMarkAsRead);

// Mark single notification as read
// PATCH /api/v1/notifications/:id/read
notificationRoute.patch("/:id/read", markAsRead);

// Mark single notification as unread
// PATCH /api/v1/notifications/:id/unread
notificationRoute.patch("/:id/unread", markAsUnread);

// ============================================
// DELETE ROUTES
// ============================================

// Delete all notifications
// DELETE /api/v1/notifications/all
notificationRoute.delete("/all", deleteAllNotifications);

// Delete all read notifications
// DELETE /api/v1/notifications/read
notificationRoute.delete("/read", deleteAllRead);

// Bulk delete notifications
// DELETE /api/v1/notifications/bulk
// Body: { notificationIds: ["id1", "id2", ...] }
notificationRoute.delete("/bulk", bulkDeleteNotifications);

// Delete single notification
// DELETE /api/v1/notifications/:id
notificationRoute.delete("/:id", deleteNotification);

export default notificationRoute;
