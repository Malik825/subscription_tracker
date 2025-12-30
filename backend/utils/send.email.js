import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";
import { emailTemplates } from "./email.template.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  console.log("\n========== SEND EMAIL FUNCTION STARTED ==========");
  console.log("📥 Input parameters:");
  console.log("   - To:", to);
  console.log("   - Type:", type);
  console.log("   - Subscription:", subscription?.name);
  console.log("   - User:", subscription?.user);

  // Validate inputs
  if (!to || !type) {
    console.error("❌ Missing required parameters!");
    console.log("   - to:", to);
    console.log("   - type:", type);
    throw new Error("Missing required parameters");
  }

  // Find template
  console.log("\n🔍 Searching for email template...");
  console.log("   Looking for:", type);
  console.log(
    "   Available templates:",
    emailTemplates.map((t) => t.label)
  );

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    console.error(`❌ Template not found for type: "${type}"`);
    console.log(
      "Available templates:",
      JSON.stringify(
        emailTemplates.map((t) => t.label),
        null,
        2
      )
    );
    throw new Error(`Invalid email type: ${type}`);
  }

  console.log("✅ Template found!");

  // Prepare mail info
  console.log("\n📝 Preparing email data...");
  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod: subscription.paymentMethod,
    accountSettingsLink: "https://yourapp.com/settings",
    supportLink: "https://yourapp.com/support",
  };

  console.log("   Mail info:", JSON.stringify(mailInfo, null, 2));

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  console.log("\n📧 Email details:");
  console.log("   Subject:", subject);
  console.log("   From:", accountEmail);
  console.log("   To:", to);
  console.log("   Body length:", message.length, "characters");

  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: subject,
    html: message,
  };

  console.log("\n📤 Attempting to send email via nodemailer...");

  // Convert callback-based sendMail to Promise
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("\n❌❌❌ EMAIL SENDING FAILED ❌❌❌");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        reject(error);
      } else {
        console.log("\n✅✅✅ EMAIL SENT SUCCESSFULLY ✅✅✅");
        console.log("Response:", info.response);
        console.log("Message ID:", info.messageId);
        console.log("Accepted:", info.accepted);
        console.log("Rejected:", info.rejected);
        console.log("========== SEND EMAIL FUNCTION ENDED ==========\n");
        resolve(info);
      }
    });
  });
};
