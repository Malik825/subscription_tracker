import mongoose from "mongoose";

/**
 * @typedef {Object} NotificationMetadata
 * @property {number} [amount]
 * @property {string} [subscriptionName]
 * @property {Date} [renewalDate]
 * @property {number} [oldPrice]
 * @property {number} [newPrice]
 * @property {number} [daysUntilRenewal]
 */

const notificationSchema = new mongoose.Schema(
  {
    // User who owns this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Related subscription (if applicable)
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "renewal", // Subscription renewal reminder
        "warning", // Unusual activity, price changes, trial ending
        "success", // Payment successful
        "reminder", // General reminder
        "payment_failed", // Payment failed
        "price_change", // Price increase/decrease
        "trial_ending", // Free trial ending soon
        "info", // General information
      ],
      required: true,
      index: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Notification message/description
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Read status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Read timestamp
    readAt: {
      type: Date,
      default: null,
    },

    // Additional metadata (optional)
    metadata: {
      amount: Number, // For payment notifications
      subscriptionName: String, // Cache subscription name
      renewalDate: Date, // For renewal reminders
      oldPrice: Number, // For price change notifications
      newPrice: Number, // For price change notifications
      daysUntilRenewal: Number, // For countdown reminders
    },

    // Priority level
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Delivery status
    delivered: {
      type: Boolean,
      default: true,
    },

    // Expiration date (optional - for auto-cleanup)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { sparse: true }); // For TTL

// Virtual for time ago (e.g., "2 hours ago")
notificationSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
});

// Static method to create a renewal reminder notification
notificationSchema.statics.createRenewalReminder = async function (
  userId,
  subscription,
  daysUntilRenewal
) {
  return await this.create({
    user: userId,
    subscription: subscription._id,
    type: "renewal",
    title: `${subscription.name} renewal ${
      daysUntilRenewal === 1 ? "tomorrow" : `in ${daysUntilRenewal} days`
    }`,
    message: `Your ${subscription.name} subscription will renew for $${
      subscription.amount
    } on ${new Date(subscription.renewalDate).toLocaleDateString()}`,
    metadata: {
      amount: subscription.amount,
      subscriptionName: subscription.name,
      renewalDate: subscription.renewalDate,
      daysUntilRenewal,
    },
    priority: daysUntilRenewal <= 1 ? "high" : "medium",
  });
};

// Static method to create payment success notification
notificationSchema.statics.createPaymentSuccess = async function (
  userId,
  subscription,
  amount
) {
  return await this.create({
    user: userId,
    subscription: subscription._id,
    type: "success",
    title: "Payment successful",
    message: `${subscription.name} payment of $${amount} was processed successfully`,
    metadata: {
      amount,
      subscriptionName: subscription.name,
    },
    priority: "low",
  });
};

// Static method to create payment failed notification
notificationSchema.statics.createPaymentFailed = async function (
  userId,
  subscription,
  amount
) {
  return await this.create({
    user: userId,
    subscription: subscription._id,
    type: "payment_failed",
    title: "Payment failed",
    message: `Your ${subscription.name} payment of $${amount} failed. Please update your payment method.`,
    metadata: {
      amount,
      subscriptionName: subscription.name,
    },
    priority: "high",
  });
};

// Static method to create price change notification
notificationSchema.statics.createPriceChange = async function (
  userId,
  subscription,
  oldPrice,
  newPrice
) {
  const isIncrease = newPrice > oldPrice;
  return await this.create({
    user: userId,
    subscription: subscription._id,
    type: "price_change",
    title: `${subscription.name} price ${
      isIncrease ? "increased" : "decreased"
    }`,
    message: `${subscription.name} subscription price changed from $${oldPrice} to $${newPrice}`,
    metadata: {
      subscriptionName: subscription.name,
      oldPrice,
      newPrice,
    },
    priority: isIncrease ? "medium" : "low",
  });
};

// Static method to create trial ending notification
notificationSchema.statics.createTrialEnding = async function (
  userId,
  subscription,
  daysRemaining
) {
  return await this.create({
    user: userId,
    subscription: subscription._id,
    type: "trial_ending",
    title: "Free trial ending soon",
    message: `Your ${subscription.name} trial ends in ${daysRemaining} day${
      daysRemaining > 1 ? "s" : ""
    }. Cancel to avoid charges.`,
    metadata: {
      subscriptionName: subscription.name,
      daysUntilRenewal: daysRemaining,
    },
    priority: "high",
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Instance method to mark as unread
notificationSchema.methods.markAsUnread = async function () {
  if (this.read) {
    this.read = false;
    this.readAt = null;
    await this.save();
  }
  return this;
};

// Pre-save hook to set expiration date (auto-delete after 30 days)
notificationSchema.pre("save", function () {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to 30 days from creation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
});

// Ensure virtual fields are included in JSON
notificationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
