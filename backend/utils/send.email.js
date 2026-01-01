import dayjs from "dayjs";
import { Resend } from "resend";
import { RESEND_API_KEY } from "../config/env.js";
import { emailTemplates } from "./email.template.js";

if (!RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY is required but not found in environment variables"
  );
}

const resend = new Resend(RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    // Log entry point
    console.log(`[EMAIL] Attempting to send ${type} email to ${to}`);

    if (!to || !type) {
      throw new Error("Missing required parameters: to and type are required");
    }

    if (!subscription?.user?.name || !subscription?.renewalDate) {
      throw new Error("Invalid subscription data");
    }

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

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

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    console.log(`[EMAIL] Sending with subject: ${subject}`);

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: message,
    });

    console.log(`[EMAIL] Success! Email ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`[EMAIL] Failed to send email:`, error.message);
    console.error(`[EMAIL] Error details:`, error);
    throw error;
  }
};
