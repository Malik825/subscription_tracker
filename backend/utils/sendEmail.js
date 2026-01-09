import { Resend } from "resend";
import { RESEND_API_KEY, FRONTEND_URL } from "../config/env.js";

if (!RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY is required but not found in environment variables"
  );
}

const resend = new Resend(RESEND_API_KEY);

// Use your custom domain email
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

    // Import dayjs here to avoid issues if not in second file
    const dayjs = (await import("dayjs")).default;

    const daysUntilRenewal = dayjs(subscription.renewalDate).diff(
      dayjs(),
      "day"
    );

    // Import welcomeEmailTemplate
    const { welcomeEmailTemplate } = await import("./email.template.js");

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

    console.log("✅ Welcome email sent successfully");
    return {
      success: true,
      message: "Welcome email sent",
      messageId: data?.id,
    };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error.message);
    // Don't throw error - we don't want email failures to break subscription creation
    return { success: false, error: error.message };
  }
};
