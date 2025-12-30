import dayjs from "dayjs";
import { createRequire } from "module";
import { sendReminderEmail } from "../utils/send.email.js";
import Subscription from "../models/subscription.model.js";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];

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
  console.log("   - Name:", subscription.name);
  console.log("   - Status:", subscription.status);
  console.log(
    "   - User:",
    subscription.user?.name,
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

  for (let i = 0; i < REMINDERS.length; i++) {
    const daysBefore = REMINDERS[i];

    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `REMINDER ${i + 1}/${REMINDERS.length}: ${daysBefore} days before`
    );
    console.log("=".repeat(60));

    const reminderDate = renewalDate.subtract(daysBefore, "day").startOf("day");
    const nowStartOfDay = now.startOf("day");

    console.log("📊 Reminder Analysis:");
    console.log(
      "   - Reminder should fire on:",
      reminderDate.format("YYYY-MM-DD")
    );
    console.log("   - Today is:", nowStartOfDay.format("YYYY-MM-DD"));
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

    // If reminder date is in the future, sleep until then
    if (reminderDate.isAfter(nowStartOfDay)) {
      console.log("\n⏰ ACTION: Sleep until reminder date");
      console.log("   - Sleeping from:", now.format("YYYY-MM-DD HH:mm:ss"));
      console.log(
        "   - Sleeping until:",
        reminderDate.format("YYYY-MM-DD HH:mm:ss")
      );
      console.log("   - Duration:", reminderDate.diff(now, "hour"), "hours");

      await sleepUntilReminder(
        context,
        `Sleep until ${daysBefore} days before`,
        reminderDate
      );

      console.log("\n⏰ WOKE UP! Time to send reminder");
      console.log("   - Current time:", dayjs().format("YYYY-MM-DD HH:mm:ss"));

      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
    }
    // If it's today, send immediately
    else if (reminderDate.isSame(nowStartOfDay, "day")) {
      console.log("\n📧 ACTION: Send reminder NOW (it's the right day!)");

      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
    }
    // If the date has passed, skip it
    else {
      console.log("\n⏭️ ACTION: Skip (reminder date has passed)");
      console.log(
        "   - Reminder was supposed to fire on:",
        reminderDate.format("YYYY-MM-DD")
      );
      console.log("   - We're already past that date");
    }
  }

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     WORKFLOW COMPLETED SUCCESSFULLY ✅         ║");
  console.log("╚════════════════════════════════════════════════╝\n");
});
const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    console.log("   🔄 Running database query...");
    const sub = await Subscription.findById(subscriptionId).populate(
      "user",
      "name email"
    );

    if (sub) {
      console.log("   ✅ Query successful");
    } else {
      console.error("   ❌ Query returned null/undefined");
    }

    return sub;
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`   💤 Calling context.sleepUntil with label: "${label}"`);
  await context.sleepUntil(label, date.toDate());
  console.log(`   ✅ Sleep completed`);
};

const triggerReminder = async (context, label, subscription) => {
  console.log(`\n┌─────────────────────────────────────────────┐`);
  console.log(`│  TRIGGERING REMINDER: ${label.padEnd(24)}│`);
  console.log(`└─────────────────────────────────────────────┘`);

  return await context.run(label, async () => {
    console.log("\n📋 Reminder Details:");
    console.log("   - Label:", label);
    console.log("   - Recipient:", subscription.user.email);
    console.log("   - Subscription:", subscription.name);
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
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  });
};
