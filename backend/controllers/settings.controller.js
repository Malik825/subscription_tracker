import Settings from "../models/settings.model.js";
import User from "../models/user.model.js";

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findByUserId(req.user._id);

    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        profile: {
          username: req.user.username,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve settings",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          "profile.username": username,
          "profile.avatarUrl": avatarUrl,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (username) {
      await User.findByIdAndUpdate(req.user._id, { username });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      error: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
      error: error.message,
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Failed to update billing settings",
      error: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    await Settings.findOneAndDelete({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

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
