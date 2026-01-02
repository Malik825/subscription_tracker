import cron from "node-cron";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upsatsh.js";

const MAX_DELAY_DAYS = 7;

/**
 * Daily cron job to check subscriptions and trigger reminder workflows
 * for those with renewals coming up within the next 7 days
 */
export const startReminderCron = () => {
  // Run every day at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║     CRON JOB: Checking Pending Reminders       ║");
    console.log("╚════════════════════════════════════════════════╝");
    console.log("⏰ Time:", dayjs().format("YYYY-MM-DD HH:mm:ss"));

    try {
      await checkAndScheduleReminders();
    } catch (error) {
      console.error("❌ Cron job failed:", error);
    }
  });

  console.log("✅ Reminder cron job scheduled (runs daily at midnight)");
};

/**
 * Check all active subscriptions and trigger workflows for upcoming renewals
 */
async function checkAndScheduleReminders() {
  const now = dayjs();
  const futureDate = now.add(MAX_DELAY_DAYS, "day");

  console.log(`\n🔍 Searching for subscriptions renewing between:`);
  console.log(`   - Now: ${now.format("YYYY-MM-DD")}`);
  console.log(`   - Future: ${futureDate.format("YYYY-MM-DD")}`);

  // Find all active subscriptions with renewals in the next 7 days
  const subscriptions = await Subscription.find({
    status: { $regex: /^active$/i }, // Case-insensitive
    renewalDate: {
      $gte: now.toDate(),
      $lte: futureDate.toDate(),
    },
  }).populate("user", "name email");

  console.log(
    `\n📊 Found ${subscriptions.length} subscription(s) needing reminders\n`
  );

  if (subscriptions.length === 0) {
    console.log("✅ No subscriptions need reminder scheduling at this time");
    return;
  }

  const results = [];

  // Trigger workflow for each subscription
  for (const subscription of subscriptions) {
    const daysUntilRenewal = dayjs(subscription.renewalDate).diff(now, "day");

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Subscription: ${subscription.name}`);
    console.log(`   - User: ${subscription.user.email}`);
    console.log(
      `   - Renewal: ${dayjs(subscription.renewalDate).format("YYYY-MM-DD")}`
    );
    console.log(`   - Days until renewal: ${daysUntilRenewal}`);

    try {
      // ✅ Trigger workflow using Upstash Workflow Client
      const workflowUrl = `${SERVER_URL}/api/v1/workflow/subscription/reminders`;

      const response = await workflowClient.trigger({
        url: workflowUrl,
        body: {
          subscriptionId: subscription._id.toString(),
        },
      });

      console.log(`   ✅ Workflow triggered successfully`);
      console.log(`   📨 Workflow Run ID: ${response.workflowRunId}`);

      results.push({
        subscriptionId: subscription._id,
        name: subscription.name,
        status: "triggered",
        workflowRunId: response.workflowRunId,
      });
    } catch (error) {
      console.error(`   ❌ Failed to trigger workflow:`, error.message);
      results.push({
        subscriptionId: subscription._id,
        name: subscription.name,
        status: "failed",
        error: error.message,
      });
    }
  }

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     CRON JOB COMPLETED                         ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  return results;
}

// Optional: Manual trigger function for testing
export const manualCheckReminders = async (req, res) => {
  try {
    console.log("\n🔧 MANUAL TRIGGER: Starting reminder check...");
    const results = await checkAndScheduleReminders();
    res.json({
      success: true,
      message: "Reminder check completed",
      results,
    });
  } catch (error) {
    console.error("❌ Manual trigger failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
