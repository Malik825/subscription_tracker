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

export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    if (!to || !type) {
      throw new Error("Missing required parameters: to and type are required");
    }

    if (!subscription) {
      throw new Error("Subscription object is missing");
    }

    if (!subscription.user) {
      throw new Error(
        "Subscription user data is missing - user may have been deleted"
      );
    }

    if (!subscription.user.username) {
      throw new Error("Username is missing");
    }

    if (!subscription.renewalDate) {
      throw new Error("Subscription renewal date is missing");
    }

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

    const mailInfo = {
      userName: subscription.user.username,
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

    await sgMail.send(msg);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const sendWelcomeEmail = async ({ to, subscription }) => {
  try {
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

    return { success: true, message: "Welcome email sent" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
