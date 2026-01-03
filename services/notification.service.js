import Notification from "../backend/models/notification.model.js";
import User from "../backend/models/user.model.js";

/**
 * ============================================
 * NOTIFICATION SERVICE
 * Handles all notification creation logic
 * ============================================
 */
const user = User;
class NotificationService {
  /**
   * Create a renewal reminder notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   * @param {number} daysUntilRenewal - Days until renewal
   */
  async createRenewalReminder(userId, subscription, daysUntilRenewal) {
    try {
      // Check if notification already exists for this subscription and day
      const existingNotification = await Notification.findOne({
        user: userId,
        subscription: subscription._id,
        type: "renewal",
        "metadata.daysUntilRenewal": daysUntilRenewal,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      });

      if (existingNotification) {
        console.log(
          `Renewal notification already exists for ${subscription.name}`
        );
        return existingNotification;
      }

      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "renewal",
        title:
          daysUntilRenewal === 1
            ? `${subscription.name} renews tomorrow`
            : daysUntilRenewal === 0
            ? `${subscription.name} renews today!`
            : `${subscription.name} renews in ${daysUntilRenewal} days`,
        message: `Your ${subscription.name} subscription (${
          subscription.currency
        } ${subscription.price}/${
          subscription.frequency
        }) will renew on ${new Date(
          subscription.renewalDate
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        metadata: {
          amount: subscription.price,
          subscriptionName: subscription.name,
          renewalDate: subscription.renewalDate,
          daysUntilRenewal,
        },
        priority: daysUntilRenewal <= 1 ? "high" : "medium",
      });

      console.log(
        `✅ Created renewal reminder for ${subscription.name} (${daysUntilRenewal} days)`
      );
      return notification;
    } catch (error) {
      console.error("Error creating renewal reminder:", error);
      throw error;
    }
  }

  /**
   * Create trial ending notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   * @param {number} daysRemaining - Days remaining in trial
   */
  async createTrialEndingNotification(userId, subscription, daysRemaining) {
    try {
      const existingNotification = await Notification.findOne({
        user: userId,
        subscription: subscription._id,
        type: "trial_ending",
        "metadata.daysUntilRenewal": daysRemaining,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existingNotification) {
        return existingNotification;
      }

      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "trial_ending",
        title:
          daysRemaining === 1
            ? `${subscription.name} trial ends tomorrow!`
            : `${subscription.name} trial ends in ${daysRemaining} days`,
        message: `Your ${subscription.trialType} trial for ${
          subscription.name
        } ends on ${new Date(subscription.trialEndDate).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        )}. You'll be charged ${subscription.currency} ${
          subscription.price
        } unless you cancel.`,
        metadata: {
          subscriptionName: subscription.name,
          daysUntilRenewal: daysRemaining,
          amount: subscription.price,
          renewalDate: subscription.trialEndDate,
        },
        priority: "high",
      });

      console.log(
        `✅ Created trial ending notification for ${subscription.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating trial ending notification:", error);
      throw error;
    }
  }

  /**
   * Create subscription status change notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  async createStatusChangeNotification(
    userId,
    subscription,
    oldStatus,
    newStatus
  ) {
    try {
      let type = "info";
      let priority = "medium";
      let title = "";
      let message = "";

      switch (newStatus) {
        case "Expired":
          type = "warning";
          priority = "high";
          title = `${subscription.name} has expired`;
          message = `Your ${subscription.name} subscription expired. Renew to continue using the service.`;
          break;

        case "Cancelled":
          type = "info";
          priority = "low";
          title = `${subscription.name} cancelled`;
          message = `You've successfully cancelled ${
            subscription.name
          }. You'll have access until ${new Date(
            subscription.renewalDate
          ).toLocaleDateString()}.`;
          break;

        case "Suspended":
          type = "warning";
          priority = "high";
          title = `${subscription.name} suspended`;
          message = `Your ${subscription.name} subscription has been suspended. Please update your payment method.`;
          break;

        case "Active":
          if (oldStatus === "Trial") {
            type = "success";
            priority = "medium";
            title = `${subscription.name} trial converted to paid`;
            message = `Your trial has ended and you're now subscribed to ${subscription.name} for ${subscription.currency} ${subscription.price}/${subscription.frequency}.`;
          } else {
            type = "success";
            priority = "low";
            title = `${subscription.name} reactivated`;
            message = `Your ${subscription.name} subscription is now active.`;
          }
          break;

        default:
          return null;
      }

      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type,
        title,
        message,
        metadata: {
          subscriptionName: subscription.name,
          amount: subscription.price,
        },
        priority,
      });

      console.log(
        `✅ Created status change notification: ${oldStatus} → ${newStatus}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating status change notification:", error);
      throw error;
    }
  }

  /**
   * Create subscription added notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   */
  async createSubscriptionAddedNotification(userId, subscription) {
    try {
      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "success",
        title: `${subscription.name} added successfully`,
        message: subscription.isTrial
          ? `You're now on a ${subscription.trialType} trial for ${
              subscription.name
            }. Trial ends ${new Date(
              subscription.trialEndDate
            ).toLocaleDateString()}.`
          : `You've added ${subscription.name} - ${subscription.currency} ${
              subscription.price
            }/${subscription.frequency}. Next billing: ${new Date(
              subscription.renewalDate
            ).toLocaleDateString()}.`,
        metadata: {
          subscriptionName: subscription.name,
          amount: subscription.price,
          renewalDate: subscription.renewalDate,
        },
        priority: "low",
      });

      console.log(
        `✅ Created subscription added notification for ${subscription.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating subscription added notification:", error);
      throw error;
    }
  }

  /**
   * Create price change notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   * @param {number} oldPrice - Previous price
   * @param {number} newPrice - New price
   */
  async createPriceChangeNotification(
    userId,
    subscription,
    oldPrice,
    newPrice
  ) {
    try {
      const isIncrease = newPrice > oldPrice;
      const difference = Math.abs(newPrice - oldPrice);
      const percentage = ((difference / oldPrice) * 100).toFixed(1);

      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "price_change",
        title: `${subscription.name} price ${
          isIncrease ? "increased" : "decreased"
        }`,
        message: `The price for ${subscription.name} changed from ${
          subscription.currency
        } ${oldPrice} to ${subscription.currency} ${newPrice} (${
          isIncrease ? "+" : "-"
        }${percentage}%). Next billing: ${new Date(
          subscription.renewalDate
        ).toLocaleDateString()}.`,
        metadata: {
          subscriptionName: subscription.name,
          oldPrice,
          newPrice,
        },
        priority: isIncrease ? "medium" : "low",
      });

      console.log(
        `✅ Created price change notification for ${subscription.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating price change notification:", error);
      throw error;
    }
  }

  /**
   * Create payment failed notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   */
  async createPaymentFailedNotification(userId, subscription) {
    try {
      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "payment_failed",
        title: `Payment failed for ${subscription.name}`,
        message: `We couldn't process your payment of ${subscription.currency} ${subscription.price} for ${subscription.name}. Please update your payment method to avoid service interruption.`,
        metadata: {
          amount: subscription.price,
          subscriptionName: subscription.name,
        },
        priority: "high",
      });

      console.log(
        `✅ Created payment failed notification for ${subscription.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating payment failed notification:", error);
      throw error;
    }
  }

  /**
   * Create payment success notification
   * @param {ObjectId} userId - User ID
   * @param {Object} subscription - Subscription object
   */
  async createPaymentSuccessNotification(userId, subscription) {
    try {
      const notification = await Notification.create({
        user: userId,
        subscription: subscription._id,
        type: "success",
        title: `Payment successful for ${subscription.name}`,
        message: `Your payment of ${subscription.currency} ${subscription.price} for ${subscription.name} was processed successfully.`,
        metadata: {
          amount: subscription.price,
          subscriptionName: subscription.name,
        },
        priority: "low",
      });

      console.log(
        `✅ Created payment success notification for ${subscription.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating payment success notification:", error);
      throw error;
    }
  }

  /**
   * Create spending alert notification
   * @param {ObjectId} userId - User ID
   * @param {number} totalSpending - Total monthly spending
   * @param {number} threshold - Spending threshold
   */
  async createSpendingAlertNotification(userId, totalSpending, threshold) {
    try {
      const notification = await Notification.create({
        user: userId,
        subscription: null,
        type: "warning",
        title: "Monthly spending threshold reached",
        message: `Your total subscription spending (${totalSpending.toFixed(
          2
        )}) has exceeded your threshold of ${threshold.toFixed(
          2
        )}. Review your subscriptions.`,
        metadata: {
          amount: totalSpending,
        },
        priority: "medium",
      });

      console.log(`✅ Created spending alert notification`);
      return notification;
    } catch (error) {
      console.error("Error creating spending alert notification:", error);
      throw error;
    }
  }

  /**
   * Clean up old notifications (called by cron job)
   * Deletes read notifications older than 30 days
   */
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await Notification.deleteMany({
        read: true,
        createdAt: { $lt: thirtyDaysAgo },
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   * (Extend User model to add preferences later)
   */
  async getUserNotificationPreferences(userId) {
    // For now, return defaults. Later integrate with User model
    return {
      emailEnabled: true,
      inAppEnabled: true,
      renewalReminders: true,
      trialReminders: true,
      priceChangeAlerts: true,
      paymentAlerts: true,
      reminderDays: [7, 3, 1], // Days before renewal to send reminders
    };
  }
}

export default new NotificationService();
