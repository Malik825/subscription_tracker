// @desc    Get user settings
// @route   GET /api/settings

import Settings from "../models/settings.model.js";
import User from "../models/user.model.js";

// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findByUserId(req.user._id);

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        profile: {
          fullName: req.user.fullName,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve settings",
      error: error.message,
    });
  }
};

// @desc    Update profile settings
// @route   PUT /api/settings/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          "profile.fullName": fullName,
          "profile.avatarUrl": avatarUrl,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Also update user's fullName if provided
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// @desc    Update account preferences
// @route   PUT /api/settings/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { darkMode, currency, language } = req.body;

    const updateData = {};
    if (darkMode !== undefined) updateData["preferences.darkMode"] = darkMode;
    if (currency) updateData["preferences.currency"] = currency;
    if (language) updateData["preferences.language"] = language;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      error: error.message,
    });
  }
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
const updateNotifications = async (req, res) => {
  try {
    const {
      emailDigest,
      pushNotifications,
      renewalReminders,
      marketingEmails,
      paymentAlerts,
      spendingInsights,
      priceChangeAlerts,
      productUpdates,
      deliveryMethods,
      renewalReminderTiming,
    } = req.body;

    const updateData = {};

    // Update individual notification preferences
    if (emailDigest !== undefined)
      updateData["notifications.emailDigest"] = emailDigest;
    if (pushNotifications !== undefined)
      updateData["notifications.pushNotifications"] = pushNotifications;
    if (renewalReminders !== undefined)
      updateData["notifications.renewalReminders"] = renewalReminders;
    if (marketingEmails !== undefined)
      updateData["notifications.marketingEmails"] = marketingEmails;
    if (paymentAlerts !== undefined)
      updateData["notifications.paymentAlerts"] = paymentAlerts;
    if (spendingInsights !== undefined)
      updateData["notifications.spendingInsights"] = spendingInsights;
    if (priceChangeAlerts !== undefined)
      updateData["notifications.priceChangeAlerts"] = priceChangeAlerts;
    if (productUpdates !== undefined)
      updateData["notifications.productUpdates"] = productUpdates;

    // Update delivery methods
    if (deliveryMethods) {
      if (deliveryMethods.email !== undefined)
        updateData["notifications.deliveryMethods.email"] =
          deliveryMethods.email;
      if (deliveryMethods.push !== undefined)
        updateData["notifications.deliveryMethods.push"] = deliveryMethods.push;
      if (deliveryMethods.inApp !== undefined)
        updateData["notifications.deliveryMethods.inApp"] =
          deliveryMethods.inApp;
    }

    // Update reminder timing
    if (renewalReminderTiming)
      updateData["notifications.renewalReminderTiming"] = renewalReminderTiming;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Notification settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

// @desc    Update billing settings
// @route   PUT /api/settings/billing
// @access  Private
const updateBilling = async (req, res) => {
  try {
    const { plan, billingCycle, status } = req.body;

    const updateData = {};
    if (plan) updateData["billing.plan"] = plan;
    if (billingCycle) updateData["billing.billingCycle"] = billingCycle;
    if (status) updateData["billing.status"] = status;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Billing settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update billing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update billing settings",
      error: error.message,
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/settings/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deleting
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Delete user settings
    await Settings.findOneAndDelete({ userId: req.user._id });

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    // Clear cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          preferences: {
            darkMode: true,
            currency: "USD",
            language: "en",
          },
          notifications: {
            emailDigest: true,
            pushNotifications: false,
            renewalReminders: true,
            marketingEmails: false,
            paymentAlerts: true,
            spendingInsights: true,
            priceChangeAlerts: false,
            productUpdates: false,
            deliveryMethods: {
              email: true,
              push: false,
              inApp: true,
            },
            renewalReminderTiming: "3days",
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Settings reset to default",
      data: settings,
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset settings",
      error: error.message,
    });
  }
};

export {
  getSettings,
  updateProfile,
  updatePreferences,
  updateNotifications,
  updateBilling,
  deleteAccount,
  resetSettings,
};
