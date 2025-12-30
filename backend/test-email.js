import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { EMAIL_PASSWORD, EMAIL_USER } from "./server/config/env.js";

dotenv.config();

console.log("🧪 Testing email configuration...\n");

// Remove these lines - already imported above!
// const EMAIL_USER = EMAIL_USER;
// const EMAIL_PASSWORD = EMAIL_PASSWORD;

console.log("Environment variables:");
console.log("   EMAIL_USER:", EMAIL_USER);
console.log(
  "   EMAIL_PASSWORD:",
  EMAIL_PASSWORD
    ? "***SET*** (length: " + EMAIL_PASSWORD.length + ")"
    : "***NOT SET***"
);

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error("\n❌ Missing EMAIL_USER or EMAIL_PASSWORD in .env file!");
  process.exit(1);
}

console.log("\n📧 Creating transporter...");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

console.log("✅ Transporter created");
console.log("\n📤 Attempting to send test email...\n");

const mailOptions = {
  from: EMAIL_USER,
  to: EMAIL_USER, // Send to yourself
  subject: "🧪 Test Email from SubDub",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #4a90e2;">✅ Email Test Successful!</h1>
      <p>If you're reading this, your email configuration is working correctly.</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This is a test email from your SubDub application.
      </p>
    </div>
  `,
};

console.log("Mail options:", {
  from: mailOptions.from,
  to: mailOptions.to,
  subject: mailOptions.subject,
});

transporter.sendMail(mailOptions, (error, info) => {
  console.log("\n" + "=".repeat(60));

  if (error) {
    console.error("❌❌❌ EMAIL TEST FAILED ❌❌❌\n");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    if (error.code === "EAUTH") {
      console.error("\n⚠️  AUTHENTICATION ERROR!");
      console.error("This usually means:");
      console.error("   1. Wrong email or password");
      console.error("   2. Not using an App Password (required for Gmail)");
      console.error("   3. 2-Factor Authentication not enabled");
      console.error("\n📝 To fix:");
      console.error("   1. Go to: https://myaccount.google.com/apppasswords");
      console.error("   2. Enable 2FA if not already enabled");
      console.error("   3. Generate an App Password");
      console.error("   4. Use that App Password in your .env file");
    }

    console.error("\nFull error object:", error);
  } else {
    console.log("✅✅✅ EMAIL SENT SUCCESSFULLY ✅✅✅\n");
    console.log("Response:", info.response);
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("\n📬 Check your inbox at:", EMAIL_USER);
  }

  console.log("=".repeat(60) + "\n");
  process.exit();
});
