import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";

import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail.js";

export const registerUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { username, email, password } = req.body;
    const existingUser = await mongoose.model("User").findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists with this email");
      error.statusCode = 409;
      throw error;
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const salt = await bcrypt.genSalt(10);
    const hashePassword = await bcrypt.hash(password, salt);
    const newUser = await User.create(
      [
        {
          username,
          email,
          password: hashePassword,
          verificationToken,
          verificationTokenExpiresAt,
          isVerified: NODE_ENV === "development", // Auto-verify in development
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send verification email asynchronously (non-blocking)
    if (NODE_ENV === "production") {
      sendVerificationEmail(email, verificationToken).catch((error) => {
        console.error("Error sending verification email:", error);
      });
    }

    res.status(201).json({
      success: true,
      message:
        NODE_ENV === "development"
          ? "User created successfully. Email verification skipped in development."
          : "User created successfully. Please check your email to verify your account.",
      data: {
        user: newUser[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // Only check verification in production
    if (NODE_ENV === "production" && !user.isVerified) {
      const error = new Error("Please verify your email to login");
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired verification token");
      error.statusCode = 400;
      throw error;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User not found with this email");
      error.statusCode = 404;
      throw error;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = otp;
    user.resetPasswordTokenExpiresAt = otpExpiresAt;
    await user.save();

    // Send password reset email asynchronously
    sendPasswordResetEmail(email, otp).catch((error) => {
      console.error("Error sending password reset email:", error);
    });

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Invalid or expired OTP");
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
