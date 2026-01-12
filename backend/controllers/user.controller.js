import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ============================================
// GET ALL USERS (Admin Only)
// ============================================
export const getAllUsers = async (req, res, next) => {
  try {
    // ✅ Check if user is admin
    if (req.user.role !== "admin") {
      const error = new Error("Access denied. Admin only.");
      error.statusCode = 403;
      throw error;
    }

    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET USER BY ID
// ============================================
export const getUser = async (req, res, next) => {
  try {
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    // ✅ IDOR Protection: Users can only access their own data
    // Unless they're an admin
    if (requestedUserId !== currentUserId && req.user.role !== "admin") {
      const error = new Error(
        "Access denied. You can only view your own profile."
      );
      error.statusCode = 403;
      throw error;
    }

    const user = await User.findById(requestedUserId).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPGRADE TO PRO
// ============================================
export const upgradeToPro = async (req, res, next) => {
  try {
    // ✅ Already protected - uses req.user._id
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan: "pro" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully upgraded to Pro!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET USER PREFERENCES
// ============================================
export const getUserPreferences = asyncHandler(async (req, res) => {
  // ✅ Already protected - uses req.user._id
  const userId = req.user._id;

  const user = await User.findById(userId).select("preferences");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const preferences = {
    soundNotifications: user.preferences?.soundNotifications ?? true,
    emailNotifications: user.preferences?.emailNotifications ?? true,
    pushNotifications: user.preferences?.pushNotifications ?? false,
    inAppNotifications: user.preferences?.inAppNotifications ?? true,
    renewalReminders: user.preferences?.renewalReminders ?? true,
    paymentAlerts: user.preferences?.paymentAlerts ?? true,
    spendingInsights: user.preferences?.spendingInsights ?? true,
    priceChanges: user.preferences?.priceChanges ?? false,
    newFeatures: user.preferences?.newFeatures ?? false,
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        preferences,
        "User preferences retrieved successfully"
      )
    );
});

// ============================================
// UPDATE USER PREFERENCE
// ============================================
export const updateUserPreference = asyncHandler(async (req, res) => {
  // ✅ Already protected - uses req.user._id
  const userId = req.user._id;
  const { key, value } = req.body;

  if (!key || typeof value !== "boolean") {
    throw new ApiError(400, "Invalid request. Provide key and boolean value");
  }

  const validKeys = [
    "soundNotifications",
    "emailNotifications",
    "pushNotifications",
    "inAppNotifications",
    "renewalReminders",
    "paymentAlerts",
    "spendingInsights",
    "priceChanges",
    "newFeatures",
  ];

  if (!validKeys.includes(key)) {
    throw new ApiError(400, "Invalid preference key");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { [`preferences.${key}`]: value },
    { new: true, runValidators: true }
  ).select("preferences");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, user.preferences, "Preference updated successfully")
    );
});
