import dayjs from "dayjs";
import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "../config/env.js";
import { emailTemplates, welcomeEmailTemplate } from "./email.template.js";

if (!SENDGRID_API_KEY) {
  throw new Error(
    "SENDGRID_API_KEY is required but not found in environment variables"
  );
}

sgMail.setApiKey(SENDGRID_API_KEY);

const FROM_EMAIL = "abdulmaliksuleman75@gmail.com";

// Replace the sendReminderEmail function in send.email.js with this:

export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    console.log("\n🔍 Email validation check:");
    console.log("   - to:", to);
    console.log("   - type:", type);
    console.log("   - subscription exists:", !!subscription);
    console.log("   - subscription._id:", subscription?._id);
    console.log("   - subscription.name:", subscription?.name);
    console.log("   - subscription.user exists:", !!subscription?.user);
    
    // Deep check of user object
    if (subscription?.user) {
      console.log("   - subscription.user type:", typeof subscription.user);
      console.log("   - subscription.user._id:", subscription.user._id);
      console.log("   - subscription.user.username:", subscription.user.username);  // ✅ Changed from name
      console.log("   - subscription.user.email:", subscription.user.email);
    } else {
      console.log("   - subscription.user: NULL/UNDEFINED");
    }
    
    console.log("   - subscription.renewalDate:", subscription?.renewalDate);

    if (!to || !type) {
      throw new Error("Missing required parameters: to and type are required");
    }

    // More detailed validation
    if (!subscription) {
      throw new Error("Subscription object is missing");
    }

    if (!subscription.user) {
      console.error("❌ Subscription user is missing!");
      console.error("Full subscription:", JSON.stringify(subscription, null, 2));
      throw new Error("Subscription user data is missing - user may have been deleted");
    }

    // ✅ FIXED: Check for username instead of name
    if (!subscription.user.username) {
      console.error("❌ Username is missing!");
      console.error("User object:", JSON.stringify(subscription.user, null, 2));
      throw new Error("Username is missing");
    }

    if (!subscription.renewalDate) {
      console.error("❌ Renewal date is missing!");
      throw new Error("Subscription renewal date is missing");
    }

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

    // ✅ FIXED: Use username instead of name
    const mailInfo = {
      userName: subscription.user.username,  // Changed from subscription.user.name
      subscriptionName: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod,
      accountSettingsLink:
        "https://subscription-tracker-lovat.vercel.app/settings",
      supportLink: "https://subscription-tracker-lovat.vercel.app/support",
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: subject,
      html: message,
    };

    console.log("\n📧 Sending email via SendGrid...");
    console.log("   - To:", to);
    console.log("   - Subject:", subject);

    await sgMail.send(msg);
    
    console.log("✅ Email sent successfully via SendGrid");
    return { success: true };
  } catch (error) {
    console.error("❌ sendReminderEmail error:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async ({ to, subscription }) => {
  try {
    console.log("\n📧 Sending welcome email...");
    console.log("   - To:", to);
    console.log("   - Subscription:", subscription.name);

    if (!to) {
      throw new Error("Missing required parameter: to (email address)");
    }

    if (!subscription?.name || !subscription?.renewalDate) {
      throw new Error("Invalid subscription data");
    }

    const daysUntilRenewal = dayjs(subscription.renewalDate).diff(
      dayjs(),
      "day"
    );

    const mailInfo = {
      userName: subscription.user?.name || "Valued Customer",
      subscriptionName: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod || "Not specified",
      accountSettingsLink:
        FRONTEND_URL || "https://subscription-tracker-lovat.vercel.app",
      supportLink:
        `${FRONTEND_URL}/support` ||
        "https://subscription-tracker-lovat.vercel.app/support",
      daysUntilRenewal: daysUntilRenewal > 0 ? daysUntilRenewal : 0,
    };

    const message = welcomeEmailTemplate.generateBody(mailInfo);
    const subject = welcomeEmailTemplate.generateSubject(mailInfo);

    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: subject,
      html: message,
    };

    await sgMail.send(msg);
    
    console.log("✅ Welcome email sent successfully");
    return { success: true, message: "Welcome email sent" };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    // Don't throw error - we don't want email failures to break subscription creation
    return { success: false, error: error.message };
  }
};
