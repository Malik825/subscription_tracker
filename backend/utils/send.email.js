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
const FROM_EMAIL = "noreply@smartauratracker.com";
const FROM_NAME = "SmartAura Tracker";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const clientUrl = FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "Verify Your Email - SmartAura Tracker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">Welcome to SmartAura Tracker!</h2>
          <p style="text-align: center; color: #333;">Please verify your email address to activate your account and start tracking your subscriptions.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Link expires in 24 hours.</p>
          <p style="text-align: center; color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
      text: `Welcome to SmartAura Tracker! Please verify your email by clicking this link: ${verificationLink}. This link expires in 24 hours.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Could not send verification email");
  }
};

export const sendPasswordResetEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "Password Reset OTP - SmartAura Tracker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">Password Reset Request</h2>
          <p style="text-align: center; color: #333;">You requested to reset your password. Use the following 6-digit code to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4a90e2; background-color: #f3f4f6; padding: 10px 20px; border-radius: 5px;">${otp}</span>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">This code expires in 15 minutes.</p>
          <p style="text-align: center; color: #999; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
      text: `Your password reset code is: ${otp}. This code expires in 15 minutes.`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Could not send password reset email");
  }
};

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

export const sendGroupInvitationEmail = async ({
  recipientEmail,
  recipientName,
  groupName,
  inviterName,
}) => {
  const subject = `🎉 You've been invited to join ${groupName}`;
  const dashboardLink = `${
    FRONTEND_URL || "http://localhost:5173"
  }/family-sharing`;

  // Import the template
  const { generateGroupInvitationTemplate } = await import(
    "./email.template.js"
  );

  const html = generateGroupInvitationTemplate({
    recipientName,
    groupName,
    inviterName,
    dashboardLink,
  });

  const text = `
Hi ${recipientName},

${inviterName} has invited you to join their subscription sharing group "${groupName}".

By joining this group, you can:
- Share subscription costs with group members
- Track payments and see who owes what
- Manage multiple subscriptions in one place
- Get automatic payment reminders

View group details: ${dashboardLink}

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
SmartAura Tracker Team
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      text: text,
      html: html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`Group invitation email sent to ${recipientEmail}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error(
      `Error sending group invitation email to ${recipientEmail}:`,
      error
    );
    throw error;
  }
};

export const sendPaymentReminderEmail = async ({
  to,
  userName,
  groupName,
  subscriptionName,
  amount,
  dueDate,
  paymentMethod,
}) => {
  try {
    if (!to || !userName || !amount || !dueDate) {
      throw new Error("Missing required parameters for payment reminder");
    }

    const formattedDueDate = dayjs(dueDate).format("MMMM D, YYYY");
    const isOverdue = dayjs(dueDate).isBefore(dayjs());
    const clientUrl = FRONTEND_URL || "http://localhost:5173";
    const paymentLink = `${clientUrl}/family-sharing`;

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: to,
      subject: isOverdue
        ? `⚠️ Overdue Payment Reminder - ${subscriptionName}`
        : `Payment Reminder - ${subscriptionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: ${
            isOverdue ? "#ef4444" : "#4a90e2"
          }; text-align: center;">
            ${isOverdue ? "⚠️ Payment Overdue" : "💳 Payment Reminder"}
          </h2>
          
          <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
          
          <p style="color: #666;">
            ${
              isOverdue
                ? "This is a reminder that your payment is overdue for:"
                : "This is a friendly reminder about your upcoming payment for:"
            }
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${
            isOverdue ? "#ef4444" : "#4a90e2"
          };">
            <p style="margin: 5px 0; color: #333;"><strong>Group:</strong> ${groupName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Subscription:</strong> ${subscriptionName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Your Share:</strong> <span style="font-size: 24px; color: ${
              isOverdue ? "#ef4444" : "#4a90e2"
            }; font-weight: bold;">$${amount}</span></p>
            <p style="margin: 5px 0; color: #333;"><strong>${
              isOverdue ? "Was Due" : "Due Date"
            }:</strong> ${formattedDueDate}</p>
            ${
              paymentMethod
                ? `<p style="margin: 5px 0; color: #333;"><strong>Payment Method:</strong> ${paymentMethod}</p>`
                : ""
            }
          </div>

          ${
            isOverdue
              ? `<div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0; font-weight: bold;">⚠️ This payment is overdue. Please submit your payment as soon as possible.</p>
            </div>`
              : ""
          }

          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: ${
        isOverdue ? "#ef4444" : "#4a90e2"
      }; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ${isOverdue ? "Pay Now" : "View Payment Details"}
            </a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            Thank you for being part of ${groupName}!
          </p>

          <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              Questions? Contact the group owner or visit our <a href="${clientUrl}/support" style="color: #4a90e2;">support page</a>
            </p>
          </div>
        </div>
      `,
      text: `
        ${isOverdue ? "PAYMENT OVERDUE" : "Payment Reminder"}
        
        Hi ${userName},
        
        ${
          isOverdue
            ? "Your payment is overdue for:"
            : "Reminder about your upcoming payment for:"
        }
        
        Group: ${groupName}
        Subscription: ${subscriptionName}
        Your Share: $${amount}
        ${isOverdue ? "Was Due" : "Due Date"}: ${formattedDueDate}
        ${paymentMethod ? `Payment Method: ${paymentMethod}` : ""}
        
        Please visit ${paymentLink} to ${
        isOverdue ? "pay now" : "view payment details"
      }.
        
        Thank you for being part of ${groupName}!
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Failed to send payment reminder:", error);
    throw new Error(`Could not send payment reminder: ${error.message}`);
  }
};
