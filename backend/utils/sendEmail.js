import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY, FRONTEND_URL } from "../config/env.js";

if (!SENDGRID_API_KEY) {
  throw new Error(
    "SENDGRID_API_KEY is required but not found in environment variables"
  );
}

sgMail.setApiKey(SENDGRID_API_KEY);

// Use your verified SendGrid email
const FROM_EMAIL = "abdulmaliksuleman75@gmail.com";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const clientUrl = FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Verify Your Email - SubDub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">Welcome to SubDub!</h2>
          <p style="text-align: center; color: #333;">Please verify your email address to activate your account and start tracking your subscriptions.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px;">Link expires in 24 hours.</p>
          <p style="text-align: center; color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
      text: `Welcome to SubDub! Please verify your email by clicking this link: ${verificationLink}. This link expires in 24 hours.`,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    throw new Error("Could not send verification email");
  }
};

export const sendPasswordResetEmail = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: FROM_EMAIL,
      subject: "Password Reset OTP - SubDub",
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
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    throw new Error("Could not send password reset email");
  }
};
