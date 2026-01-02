import dayjs from "dayjs";
import { createRequire } from "module";
import { sendReminderEmail } from "../utils/send.email.js";
import Subscription from "../models/subscription.model.js";

const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];
const MAX_DELAY_DAYS = 7;

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) {
    return;
  }

  if (subscription.status.toLowerCase() !== "active") {
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  const now = dayjs();

  if (renewalDate.isBefore(now, "day")) {
    return;
  }

  if (renewalDate.diff(now, "day") > MAX_DELAY_DAYS) {
    return {
      message: "Renewal too far in future, will reschedule via cron",
      daysUntilRenewal: renewalDate.diff(now, "day"),
      renewalDate: renewalDate.format("YYYY-MM-DD"),
    };
  }

  for (let i = 0; i < REMINDERS.length; i++) {
    const daysBefore = REMINDERS[i];

    const reminderDate = renewalDate.subtract(daysBefore, "day").startOf("day");
    const nowStartOfDay = now.startOf("day");

    if (reminderDate.isBefore(nowStartOfDay)) {
      continue;
    }

    if (reminderDate.isSame(nowStartOfDay, "day")) {
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription._id
      );
      continue;
    }

    await sleepUntilReminder(
      context,
      `Sleep until ${daysBefore} days before`,
      reminderDate
    );

    await triggerReminder(
      context,
      `${daysBefore} days before reminder`,
      subscription._id
    );
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return await Subscription.findById(subscriptionId).populate(
      "user",
      "username email"
    );
  });
};

const sleepUntilReminder = async (context, label, date) => {
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscriptionOrId) => {
  return await context.run(label, async () => {
    let subscription;
    let subscriptionId;

    if (typeof subscriptionOrId === "object" && subscriptionOrId._id) {
      subscriptionId = subscriptionOrId._id;
    } else {
      subscriptionId = subscriptionOrId;
    }

    try {
      subscription = await Subscription.findById(subscriptionId).populate(
        "user",
        "username email"
      );
    } catch (error) {
      throw error;
    }

    if (!subscription) {
      throw new Error(`Subscription not found with ID: ${subscriptionId}`);
    }

    if (!subscription.user) {
      throw new Error("User data missing on subscription");
    }

    if (!subscription.user.email || !subscription.user.username) {
      throw new Error("User email or username missing");
    }

    try {
      return await sendReminderEmail({
        to: subscription.user.email,
        type: label,
        subscription,
      });
    } catch (error) {
      throw error;
    }
  });
};
