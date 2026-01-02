import cron from "node-cron";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";

const MAX_DELAY_DAYS = 7;
const WORKFLOW_URL =
  process.env.QSTASH_WORKFLOW_URL ||
  "https://subscription-tracker-40a6.onrender.com/api/workflow/reminders";

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
      // Trigger the workflow via QStash
      await qstashClient.publishJSON({
        url: `${process.env.APP_URL}/api/workflow/reminders`,
        body: {
          subscriptionId: subscription._id.toString(),
          userId: subscription.user._id.toString(),
          renewalDate: subscription.renewalDate,
        },
      });

      console.log(`   ✅ Workflow triggered successfully`);
    } catch (error) {
      console.error(`   ❌ Failed to trigger workflow:`, error.message);
    }
  }

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     CRON JOB COMPLETED                         ║");
  console.log("╚════════════════════════════════════════════════╝\n");
}

// Optional: Manual trigger function for testing
export const manualCheckReminders = async (req, res) => {
  try {
    await checkAndScheduleReminders();
    res.json({ success: true, message: "Reminder check completed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
