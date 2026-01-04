import cron from "node-cron";
import Subscription from "../models/subscription.model.js";
import notificationService from "../../services/notification.service.js";

/**
 * ============================================
 * NOTIFICATION SCHEDULER
 * Runs automated jobs to create notifications
 * ============================================
 */

class NotificationScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all scheduled notification jobs
   */
  start() {
    console.log("🚀 Starting notification scheduler...");

    // Job 1: Check for upcoming renewals (runs daily at 9 AM)
    this.scheduleRenewalReminders();

    // Job 2: Check for ending trials (runs daily at 9 AM)
    this.scheduleTrialReminders();

    // Job 3: Update expired subscriptions (runs every hour)
    this.scheduleExpiredSubscriptionsCheck();

    // Job 4: Cleanup old notifications (runs weekly on Sunday at 2 AM)
    this.scheduleNotificationCleanup();

    console.log(`✅ ${this.jobs.length} notification jobs scheduled`);
  }

  /**
   * Schedule renewal reminder notifications
   * Runs daily at 9:00 AM
   */
  scheduleRenewalReminders() {
    const job = cron.schedule("0 9 * * *", async () => {
      console.log("⏰ Running renewal reminder job...");

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Days to check: 7, 3, 1, and 0 (today)
        const reminderDays = [7, 3, 1, 0];
        let totalNotifications = 0;

        for (const days of reminderDays) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + days);

          const startOfDay = new Date(targetDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(targetDate);
          endOfDay.setHours(23, 59, 59, 999);

          // Find active subscriptions renewing on target date
          const subscriptions = await Subscription.find({
            renewalDate: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            status: "Active",
            isTrial: false,
          }).populate("user");

          // Create notifications
          for (const subscription of subscriptions) {
            try {
              await notificationService.createRenewalReminder(
                subscription.user._id,
                subscription,
                days
              );
              totalNotifications++;
            } catch (error) {
              console.error(
                `Failed to create renewal reminder for ${subscription.name}:`,
                error.message
              );
            }
          }

          console.log(
            `📧 Created ${
              subscriptions.length
            } renewal reminders for ${days} day${days !== 1 ? "s" : ""} out`
          );
        }

        console.log(
          `✅ Renewal reminder job completed: ${totalNotifications} notifications created`
        );
      } catch (error) {
        console.error("❌ Renewal reminder job failed:", error);
      }
    });

    this.jobs.push({
      name: "Renewal Reminders",
      schedule: "Daily at 9 AM",
      job,
    });
    console.log("✓ Scheduled: Renewal reminders (daily at 9 AM)");
  }

  /**
   * Schedule trial ending reminder notifications
   * Runs daily at 9:00 AM
   */
  scheduleTrialReminders() {
    const job = cron.schedule("0 9 * * *", async () => {
      console.log("⏰ Running trial reminder job...");

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check for trials ending in 3, 1, and 0 days
        const reminderDays = [3, 1, 0];
        let totalNotifications = 0;

        for (const days of reminderDays) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + days);

          const startOfDay = new Date(targetDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(targetDate);
          endOfDay.setHours(23, 59, 59, 999);

          // Find trial subscriptions ending on target date
          const subscriptions = await Subscription.find({
            trialEndDate: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            status: "Trial",
            isTrial: true,
          }).populate("user");

          // Create notifications
          for (const subscription of subscriptions) {
            try {
              await notificationService.createTrialEndingNotification(
                subscription.user._id,
                subscription,
                days
              );
              totalNotifications++;
            } catch (error) {
              console.error(
                `Failed to create trial reminder for ${subscription.name}:`,
                error.message
              );
            }
          }

          console.log(
            `🆓 Created ${
              subscriptions.length
            } trial reminders for ${days} day${days !== 1 ? "s" : ""} out`
          );
        }

        console.log(
          `✅ Trial reminder job completed: ${totalNotifications} notifications created`
        );
      } catch (error) {
        console.error("❌ Trial reminder job failed:", error);
      }
    });

    this.jobs.push({ name: "Trial Reminders", schedule: "Daily at 9 AM", job });
    console.log("✓ Scheduled: Trial reminders (daily at 9 AM)");
  }

  /**
   * Check and update expired subscriptions
   * Runs every hour
   */
  scheduleExpiredSubscriptionsCheck() {
    const job = cron.schedule("0 * * * *", async () => {
      console.log("⏰ Running expired subscriptions check...");

      try {
        const now = new Date();
        let expiredCount = 0;

        // Find subscriptions that should be expired
        const expiredSubscriptions = await Subscription.find({
          $or: [
            // Active subscriptions past renewal date
            {
              status: "Active",
              renewalDate: { $lt: now },
              isTrial: false,
            },
            // Trial subscriptions past trial end date
            {
              status: "Trial",
              isTrial: true,
              trialEndDate: { $lt: now },
            },
          ],
        }).populate("user");

        // Update status and create notifications
        for (const subscription of expiredSubscriptions) {
          const oldStatus = subscription.status;
          subscription.status = "Expired";

          if (subscription.isTrial) {
            subscription.isTrial = false;
          }

          await subscription.save();

          // Create status change notification
          await notificationService.createStatusChangeNotification(
            subscription.user._id,
            subscription,
            oldStatus,
            "Expired"
          );

          expiredCount++;
        }

        if (expiredCount > 0) {
          console.log(`⚠️ Updated ${expiredCount} expired subscriptions`);
        }
      } catch (error) {
        console.error("❌ Expired subscriptions check failed:", error);
      }
    });

    this.jobs.push({
      name: "Expired Subscriptions Check",
      schedule: "Every hour",
      job,
    });
    console.log("✓ Scheduled: Expired subscriptions check (hourly)");
  }

  /**
   * Cleanup old read notifications
   * Runs weekly on Sunday at 2 AM
   */
  scheduleNotificationCleanup() {
    const job = cron.schedule("0 2 * * 0", async () => {
      console.log("⏰ Running notification cleanup job...");

      try {
        const deletedCount =
          await notificationService.cleanupOldNotifications();
        console.log(
          `✅ Notification cleanup completed: ${deletedCount} notifications deleted`
        );
      } catch (error) {
        console.error("❌ Notification cleanup job failed:", error);
      }
    });

    this.jobs.push({
      name: "Notification Cleanup",
      schedule: "Weekly (Sunday 2 AM)",
      job,
    });
    console.log("✓ Scheduled: Notification cleanup (weekly on Sunday at 2 AM)");
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log("🛑 Stopping all notification jobs...");
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`✓ Stopped: ${name}`);
    });
    this.jobs = [];
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    return this.jobs.map(({ name, schedule }) => ({
      name,
      schedule,
      running: true,
    }));
  }
}

// Create singleton instance
const scheduler = new NotificationScheduler();

export default scheduler;
