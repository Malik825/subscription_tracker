import Notification from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// ============================================
// GET ALL NOTIFICATIONS FOR A USER
// ============================================
// GET /api/v1/notifications
// Query params: ?read=true/false, ?type=renewal, ?limit=20, ?page=1
export const getAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { read, type, limit = 20, page = 1 } = req.query;

  // Build query
  const query = { user: userId };

  // Filter by read status if provided
  if (read !== undefined) {
    query.read = read === "true";
  }

  // Filter by type if provided
  if (type) {
    query.type = type;
  }

  // Calculate skip for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get notifications with pagination
  const notifications = await Notification.find(query)
    .populate("subscription", "name amount billingCycle category")
    .sort({ createdAt: -1 }) // Most recent first
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  // Get total count for pagination
  const totalCount = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    read: false,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit),
        },
        unreadCount,
      },
      "Notifications retrieved successfully"
    )
  );
});

// ============================================
// GET SINGLE NOTIFICATION
// ============================================
// GET /api/v1/notifications/:id
export const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({
    _id: id,
    user: userId,
  }).populate("subscription", "name amount billingCycle category");

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification retrieved successfully")
    );
});

// ============================================
// GET UNREAD COUNT
// ============================================
// GET /api/v1/notifications/unread/count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const unreadCount = await Notification.countDocuments({
    user: userId,
    read: false,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { unreadCount },
        "Unread count retrieved successfully"
      )
    );
});

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.markAsRead();

  res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

// ============================================
// MARK NOTIFICATION AS UNREAD
// ============================================
// PATCH /api/v1/notifications/:id/unread
export const markAsUnread = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOne({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.markAsUnread();

  res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as unread"));
});

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
// PATCH /api/v1/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { user: userId, read: false },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "All notifications marked as read"
      )
    );
});

// ============================================
// DELETE NOTIFICATION
// ============================================
// DELETE /api/v1/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully"));
});

// ============================================
// DELETE ALL READ NOTIFICATIONS
// ============================================
// DELETE /api/v1/notifications/read
export const deleteAllRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.deleteMany({
    user: userId,
    read: true,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "All read notifications deleted successfully"
      )
    );
});

// ============================================
// DELETE ALL NOTIFICATIONS
// ============================================
// DELETE /api/v1/notifications/all
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.deleteMany({
    user: userId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "All notifications deleted successfully"
      )
    );
});

// ============================================
// CREATE NOTIFICATION (Manual - for testing)
// ============================================
// POST /api/v1/notifications
export const createNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, title, message, subscription, priority, metadata } = req.body;

  // Validate required fields
  if (!type || !title || !message) {
    throw new ApiError(400, "Type, title, and message are required");
  }

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    subscription: subscription || null,
    priority: priority || "medium",
    metadata: metadata || {},
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, notification, "Notification created successfully")
    );
});

// ============================================
// GET NOTIFICATION STATISTICS
// ============================================
// GET /api/v1/notifications/stats
export const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get counts by type
  const typeStats = await Notification.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] },
        },
      },
    },
  ]);

  // Get total counts
  const totalCount = await Notification.countDocuments({ user: userId });
  const unreadCount = await Notification.countDocuments({
    user: userId,
    read: false,
  });
  const readCount = totalCount - unreadCount;

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentCount = await Notification.countDocuments({
    user: userId,
    createdAt: { $gte: sevenDaysAgo },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        recentCount,
        byType: typeStats,
      },
      "Notification statistics retrieved successfully"
    )
  );
});

// ============================================
// BULK MARK AS READ
// ============================================
// PATCH /api/v1/notifications/bulk/read
export const bulkMarkAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "notificationIds array is required");
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      user: userId,
      read: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      },
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "Notifications marked as read"
      )
    );
});

// ============================================
// BULK DELETE
// ============================================
// DELETE /api/v1/notifications/bulk
export const bulkDeleteNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "notificationIds array is required");
  }

  const result = await Notification.deleteMany({
    _id: { $in: notificationIds },
    user: userId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Notifications deleted successfully"
      )
    );
});
