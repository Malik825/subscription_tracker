import cron from "node-cron";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upsatsh.js";

const MAX_DELAY_DAYS = 7;

export const startReminderCron = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await checkAndScheduleReminders();
    } catch (error) {}
  });
};

async function checkAndScheduleReminders() {
  const now = dayjs();
  const futureDate = now.add(MAX_DELAY_DAYS, "day");

  const subscriptions = await Subscription.find({
    status: { $regex: /^active$/i },
    renewalDate: {
      $gte: now.toDate(),
      $lte: futureDate.toDate(),
    },
  }).populate("user", "name email");

  if (subscriptions.length === 0) {
    return;
  }

  const results = [];

  for (const subscription of subscriptions) {
    try {
      const workflowUrl = `${SERVER_URL}/api/v1/workflow/subscription/reminders`;

      const response = await workflowClient.trigger({
        url: workflowUrl,
        body: {
          subscriptionId: subscription._id.toString(),
        },
      });

      results.push({
        subscriptionId: subscription._id,
        name: subscription.name,
        status: "triggered",
        workflowRunId: response.workflowRunId,
      });
    } catch (error) {
      results.push({
        subscriptionId: subscription._id,
        name: subscription.name,
        status: "failed",
        error: error.message,
      });
    }
  }

  return results;
}

export const manualCheckReminders = async (req, res) => {
  try {
    const results = await checkAndScheduleReminders();
    res.json({
      success: true,
      message: "Reminder check completed",
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
