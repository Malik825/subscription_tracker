import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
  } catch (error) {
    next(error);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const users = await User.findById(req.params.id).select("-password");
    if (!users) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res
      .status(200)
      .json({
        success: true,
        message: "User retrieved successfully",
        data: users,
      });
  } catch (error) {
    next(error);
  }
};

export const upgradeToPro = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan: "pro" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
export const getUserPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("preferences");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Return with defaults if preferences don't exist
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
// PATCH /api/v1/users/preferences
export const updateUserPreference = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { key, value } = req.body;

  // Validate input
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

  // Update the specific preference
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
