import dayjs from "dayjs";
import { createRequire } from "module";
import { sendReminderEmail } from "../utils/send.email.js";
import Subscription from "../models/subscription.model.js";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];
const MAX_DELAY_DAYS = 7; // QStash limit: 7 days (604800 seconds)

export const sendReminders = serve(async (context) => {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     WORKFLOW STARTED - SUBSCRIPTION REMINDERS  ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  console.log(
    "📦 Request Payload:",
    JSON.stringify(context.requestPayload, null, 2)
  );

  const { subscriptionId } = context.requestPayload;
  console.log("🆔 Subscription ID:", subscriptionId);

  // Fetch subscription
  console.log("\n🔍 Fetching subscription from database...");
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) {
    console.error("❌ Subscription not found!");
    return;
  }

  console.log("✅ Subscription found:");
  console.log("   - username:", subscription.username);
  console.log("   - Status:", subscription.status);
  console.log(
    "   - User:",
    subscription.user?.username,
    `(${subscription.user?.email})`
  );
  console.log("   - Renewal Date:", subscription.renewalDate);

  // FIX: Case-insensitive comparison
  if (subscription.status.toLowerCase() !== "active") {
    console.warn("⚠️ Subscription is not active. Stopping workflow.");
    console.log("   Current status:", subscription.status);
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);
  const now = dayjs();

  console.log("\n📅 Date Information:");
  console.log("   - Current Date:", now.format("YYYY-MM-DD HH:mm:ss"));
  console.log("   - Renewal Date:", renewalDate.format("YYYY-MM-DD HH:mm:ss"));
  console.log("   - Days Until Renewal:", renewalDate.diff(now, "day"));

  if (renewalDate.isBefore(now, "day")) {
    console.error("❌ Renewal date has already passed!");
    console.log("   - Renewal was:", renewalDate.format("MMM D, YYYY"));
    console.log("   - Today is:", now.format("MMM D, YYYY"));
    console.log("   - Stopping workflow.");
    return;
  }

  console.log("\n🔔 Processing reminders...");
  console.log("Reminder schedule:", REMINDERS, "days before renewal\n");

  // Early exit if renewal is too far in the future
  if (renewalDate.diff(now, "day") > MAX_DELAY_DAYS) {
    console.log("\n⚠️ Renewal is more than 7 days away");
    console.log(`   Days until renewal: ${renewalDate.diff(now, "day")}`);
    console.log(
      "   This workflow will be re-triggered by the cron job when closer"
    );
    console.log("   Exiting workflow now.");
    return {
      message: "Renewal too far in future, will reschedule via cron",
      daysUntilRenewal: renewalDate.diff(now, "day"),
      renewalDate: renewalDate.format("YYYY-MM-DD"),
    };
  }

  console.log("\n✅ Renewal is within 7 days - processing reminders...");
  console.log("🔔 Processing reminders...");
  console.log("Reminder schedule:", REMINDERS, "days before renewal\n");

  for (let i = 0; i < REMINDERS.length; i++) {
    const daysBefore = REMINDERS[i];

    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `REMINDER ${i + 1}/${REMINDERS.length}: ${daysBefore} days before`
    );
    console.log("=".repeat(60));

    const reminderDate = renewalDate.subtract(daysBefore, "day").startOf("day");
    const nowStartOfDay = now.startOf("day");
    const daysUntilReminder = reminderDate.diff(nowStartOfDay, "day");

    console.log("📊 Reminder Analysis:");
    console.log(
      "   - Reminder should fire on:",
      reminderDate.format("YYYY-MM-DD")
    );
    console.log("   - Today is:", nowStartOfDay.format("YYYY-MM-DD"));
    console.log("   - Days until reminder:", daysUntilReminder);
    console.log(
      "   - Is reminder in future?",
      reminderDate.isAfter(nowStartOfDay)
    );
    console.log(
      "   - Is reminder today?",
      reminderDate.isSame(nowStartOfDay, "day")
    );
    console.log(
      "   - Has reminder passed?",
      reminderDate.isBefore(nowStartOfDay)
    );

    // Skip if reminder has passed
    if (reminderDate.isBefore(nowStartOfDay)) {
      console.log("\n⏭️ ACTION: Skip (reminder date has passed)");
      continue;
    }

    // Send immediately if it's today
    if (reminderDate.isSame(nowStartOfDay, "day")) {
      console.log("\n📧 ACTION: Send reminder NOW (it's the right day!)");
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
      continue;
    }

    // Sleep until reminder date (we know it's within 7 days because of early exit)
    console.log("\n⏰ ACTION: Sleep until reminder date");
    console.log("   - Sleeping from:", now.format("YYYY-MM-DD HH:mm:ss"));
    console.log(
      "   - Sleeping until:",
      reminderDate.format("YYYY-MM-DD HH:mm:ss")
    );
    console.log("   - Duration:", daysUntilReminder, "days");

    await sleepUntilReminder(
      context,
      `Sleep until ${daysBefore} days before`,
      reminderDate
    );

    console.log("\n⏰ WOKE UP! Time to send reminder");
    await triggerReminder(
      context,
      `${daysBefore} days before reminder`,
      subscription._id
    );
  }

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     WORKFLOW COMPLETED SUCCESSFULLY ✅         ║");
  console.log("╚════════════════════════════════════════════════╝\n");
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    const subscription = await Subscription.findById(subscriptionId).populate(
      "user",
      "username email"
    );

    // ✅ Add debug logging
    console.log("📦 Fetched subscription user data:");
    console.log("   - User exists:", !!subscription?.user);
    console.log("   - User username:", subscription?.user?.username);
    console.log("   - User email:", subscription?.user?.email);

    return subscription;
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`   💤 Calling context.sleepUntil with label: "${label}"`);
  await context.sleepUntil(label, date.toDate());
  console.log(`   ✅ Sleep completed`);
};

// Replace the triggerReminder function in workflow.controller.js with this:

const triggerReminder = async (context, label, subscriptionOrId) => {
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│  TRIGGERING REMINDER: ${label.padEnd(24)}│`);
  console.log(`└─────────────────────────────────────────────┘`);

  return await context.run(label, async () => {
    let subscription;
    let subscriptionId;

    // Handle both subscription object and ID
    if (typeof subscriptionOrId === "object" && subscriptionOrId._id) {
      subscriptionId = subscriptionOrId._id;
      console.log(
        "📦 Received subscription object, refetching with ID:",
        subscriptionId
      );
    } else {
      subscriptionId = subscriptionOrId;
      console.log("📦 Received subscription ID:", subscriptionId);
    }

    // Always refetch to ensure user is populated (critical after sleep/wakeup)
    try {
      subscription = await Subscription.findById(subscriptionId).populate(
        "user",
        "userusername email" // ✅ FIXED: Changed from "username email" to "userusername email"
      );

      console.log("✅ Subscription fetched from database");
      console.log("   - Subscription exists:", !!subscription);
      console.log("   - User field exists:", !!subscription?.user);
      console.log(
        "   - User is populated:",
        subscription?.user?._id ? "Yes" : "No"
      );
    } catch (fetchError) {
      console.error("❌ Error fetching subscription:", fetchError.message);
      throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
    }

    if (!subscription) {
      throw new Error(`Subscription not found with ID: ${subscriptionId}`);
    }

    // ✅ Critical check: Ensure user is populated
    if (!subscription.user) {
      console.error(
        "❌❌❌ CRITICAL ERROR: User not populated on subscription!"
      );
      console.error("Subscription ID:", subscription._id);
      console.error("Subscription user field:", subscription.user);
      throw new Error(
        "User data not found on subscription. The user reference may be invalid or deleted."
      );
    }

    if (!subscription.user.email || !subscription.user.userusername) {
      console.error("❌❌❌ CRITICAL ERROR: User data incomplete!");
      console.error("User object:", JSON.stringify(subscription.user, null, 2));
      throw new Error("User email or userusername is missing");
    }

    console.log("\n📋 Reminder Details:");
    console.log("   - Label:", label);
    console.log("   - User ID:", subscription.user._id);
    console.log("   - Recipient:", subscription.user.email);
    console.log("   - Userusername:", subscription.user.userusername); // ✅ Changed from username to userusername
    console.log("   - Subscription:", subscription.username);
    console.log(
      "   - Renewal Date:",
      dayjs(subscription.renewalDate).format("MMM D, YYYY")
    );

    console.log("\n🚀 Calling sendReminderEmail function...");

    try {
      const result = await sendReminderEmail({
        to: subscription.user.email,
        type: label,
        subscription,
      });

      console.log("\n✅✅✅ REMINDER SENT SUCCESSFULLY ✅✅✅");
      console.log("Result:", result);

      return result;
    } catch (error) {
      console.error("\n❌❌❌ REMINDER FAILED ❌❌❌");
      console.error("Error username:", error.username);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  });
};
