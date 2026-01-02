import dayjs from "dayjs";
import { createRequire } from "module";
import { sendReminderEmail } from "../utils/send.email.js";
import Subscription from "../models/subscription.model.js";

const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];
const TRIAL_REMINDERS = [2, 1];
const MAX_DELAY_DAYS = 7;

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) {
    return;
  }

  if (
    subscription.status.toLowerCase() !== "active" &&
    subscription.status.toLowerCase() !== "trial"
  ) {
    return;
  }

  const isTrial = subscription.isTrial && subscription.trialType !== "none";
  const targetDate = isTrial
    ? dayjs(subscription.trialEndDate)
    : dayjs(subscription.renewalDate);
  const now = dayjs();

  if (targetDate.isBefore(now, "day")) {
    return;
  }

  if (targetDate.diff(now, "day") > MAX_DELAY_DAYS) {
    return {
      message: isTrial
        ? "Trial end too far in future, will reschedule via cron"
        : "Renewal too far in future, will reschedule via cron",
      daysUntilTarget: targetDate.diff(now, "day"),
      targetDate: targetDate.format("YYYY-MM-DD"),
      isTrial,
    };
  }

  const remindersToUse = isTrial ? TRIAL_REMINDERS : REMINDERS;

  for (let i = 0; i < remindersToUse.length; i++) {
    const daysBefore = remindersToUse[i];

    const reminderDate = targetDate.subtract(daysBefore, "day").startOf("day");
    const nowStartOfDay = now.startOf("day");

    if (reminderDate.isBefore(nowStartOfDay)) {
      continue;
    }

    if (reminderDate.isSame(nowStartOfDay, "day")) {
      await triggerReminder(
        context,
        isTrial
          ? `Trial ending in ${daysBefore} days`
          : `${daysBefore} days before reminder`,
        subscription._id,
        isTrial
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
      isTrial
        ? `Trial ending in ${daysBefore} days`
        : `${daysBefore} days before reminder`,
      subscription._id,
      isTrial
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

const triggerReminder = async (
  context,
  label,
  subscriptionOrId,
  isTrial = false
) => {
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
        type: isTrial ? "trial-ending" : label,
        subscription,
        isTrial,
      });
    } catch (error) {
      throw error;
    }
  });
};
