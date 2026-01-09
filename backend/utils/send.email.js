import dayjs from "dayjs";
import { Resend } from "resend";
import { RESEND_API_KEY, FRONTEND_URL } from "../config/env.js";
import { emailTemplates, welcomeEmailTemplate } from "./email.template.js";

if (!RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY is required but not found in environment variables"
  );
}

const resend = new Resend(RESEND_API_KEY);

// Use your custom domain email
const FROM_EMAIL = "noreply@smartauratracker.com";
const FROM_NAME = "SmartAura Tracker";

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
        `${FRONTEND_URL}/settings` ||
        "https://www.smartauratracker.com/settings",
      supportLink:
        `${FRONTEND_URL}/support` || "https://www.smartauratracker.com/support",
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: message,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
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
      accountSettingsLink: FRONTEND_URL || "https://www.smartauratracker.com",
      supportLink:
        `${FRONTEND_URL}/support` || "https://www.smartauratracker.com/support",
      daysUntilRenewal: daysUntilRenewal > 0 ? daysUntilRenewal : 0,
    };

    const message = welcomeEmailTemplate.generateBody(mailInfo);
    const subject = welcomeEmailTemplate.generateSubject(mailInfo);

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: message,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Welcome email sent",
      messageId: data?.id,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
