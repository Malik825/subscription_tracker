import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Profile Settings
    profile: {
      fullName: {
        type: String,
        trim: true,
      },
      avatarUrl: {
        type: String,
        default: null,
      },
    },
    // Account Preferences
    preferences: {
      darkMode: {
        type: Boolean,
        default: true,
      },
      currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "NGN", "GHS", "KES", "ZAR"],
        default: "USD",
      },
      language: {
        type: String,
        enum: ["en", "fr", "es", "de"],
        default: "en",
      },
    },
    // Notification Settings
    notifications: {
      emailDigest: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      renewalReminders: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      paymentAlerts: {
        type: Boolean,
        default: true,
      },
      spendingInsights: {
        type: Boolean,
        default: true,
      },
      priceChangeAlerts: {
        type: Boolean,
        default: false,
      },
      productUpdates: {
        type: Boolean,
        default: false,
      },
      // Delivery Methods
      deliveryMethods: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: false,
        },
        inApp: {
          type: Boolean,
          default: true,
        },
      },
      // Reminder Timing
      renewalReminderTiming: {
        type: String,
        enum: ["1day", "3days", "1week", "2weeks"],
        default: "3days",
      },
    },
    // Billing Settings
    billing: {
      plan: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "trial", "cancelled"],
        default: "trial",
      },
      trialEndsAt: {
        type: Date,
        default: null,
      },
      subscriptionEndsAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
settingsSchema.index({ userId: 1 });

// Method to get settings by userId
settingsSchema.statics.findByUserId = async function (userId) {
  return await this.findOne({ userId });
};

// Method to create or update settings
settingsSchema.statics.upsertSettings = async function (userId, updates) {
  return await this.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
};

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
