import cron from "node-cron";
import Payment from "../models/payment.model.js";

export const startPaymentCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🔄 Running daily overdue payment check...");

      const result = await Payment.checkAndUpdateOverdue();

      console.log(`✅ Marked ${result.modifiedCount} payments as overdue`);
    } catch (error) {
      console.error("❌ Error checking overdue payments:", error);
    }
  });

  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("📧 Sending payment reminders...");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const dueTomorrow = await Payment.find({
        status: "pending",
        dueDate: {
          $gte: tomorrow,
          $lte: endOfTomorrow,
        },
      })
        .populate("payer", "email username")
        .populate("subscription", "name price")
        .populate("sharingGroup", "name");

      console.log(`📬 Found ${dueTomorrow.length} payments due tomorrow`);
    } catch (error) {
      console.error("❌ Error sending payment reminders:", error);
    }
  });

  console.log("✅ Payment cron jobs initialized");
};
