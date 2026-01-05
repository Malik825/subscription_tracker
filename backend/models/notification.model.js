import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "renewal",
        "warning",
        "success",
        "reminder",
        "payment_failed",
        "price_change",
        "trial_ending",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    metadata: {
      amount: Number,
      subscriptionName: String,
      renewalDate: Date,
      oldPrice: Number,
      newPrice: Number,
      daysUntilRenewal: Number,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    delivered: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { sparse: true });

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

notificationSchema.methods.markAsRead = async function () {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

notificationSchema.methods.markAsUnread = async function () {
  if (this.read) {
    this.read = false;
    this.readAt = null;
    await this.save();
  }
  return this;
};

notificationSchema.pre("save", function () {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
});

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
