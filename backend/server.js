import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { PORT, NODE_ENV, FRONTEND_URL } from "./config/env.js";
import connectDB from "./database/mongodb.js";

import {
  defaultRateLimiter,
  authRateLimiter,
  authenticatedRateLimiter,
  aiRateLimiter,
  webhookRateLimiter,
} from "./config/rateLimiter.js";

import { errorHandler } from "./middlewares/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import workflowRouter from "./routes/workflow.route.js";
import paymentRouter from "./routes/payment.route.js";
import aiRoutes from "./routes/ai.route.js";
import notificationRouter from "./routes/notifications.route.js";

import { startReminderCron } from "./utils/check-reminders.cron.js";
import notificationScheduler from "./utils/notificationScheduler.js";
import settingsRouter from "./routes/settings.route.js";
import paymentTrackingRoutes from "./routes/paymentTracking.routes.js";
import sharingGroupRoutes from "./routes/sharingGroup.route.js";

const app = express();

if (NODE_ENV === "production") {
  console.log("✓ Trust proxy enabled for production");
}

const allowedOrigins = [FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ============================================
// CRITICAL: Webhook routes MUST come BEFORE express.json()
// They need raw body for signature verification
// ============================================
app.use(
  "/api/v1/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  webhookRateLimiter,
  paymentRouter
);
app.use(
  "/api/v1/payments/paystack/webhook",
  express.raw({ type: "application/json" }),
  webhookRateLimiter,
  paymentRouter
);

// Now apply JSON parsing for all other routes
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(defaultRateLimiter);

app.get("/", (req, res) => {
  res.send("Welcome to Subscription Tracker App");
});

app.use("/api/v1/auth", authRateLimiter, authRouter);

app.use("/api/v1/users", authenticatedRateLimiter, userRouter);

app.use("/api/v1/subscriptions", authenticatedRateLimiter, subscriptionRouter);

app.use("/api/v1/workflow", authenticatedRateLimiter, workflowRouter);

// Regular payment routes (non-webhook)
app.use("/api/v1/payments", webhookRateLimiter, paymentRouter);

app.use("/api/v1/ai", aiRateLimiter, aiRoutes);

app.use("/api/v1/notifications", authenticatedRateLimiter, notificationRouter);

app.use("/api/v1/settings", authenticatedRateLimiter, settingsRouter);

app.use("/api/v1/sharing-groups", authenticatedRateLimiter, sharingGroupRoutes);

app.use(
  "/api/v1/payment-tracking",
  authenticatedRateLimiter,
  paymentTrackingRoutes
);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`✓ Express Rate Limit enabled for all routes`);
  console.log(`  - Default: 100 req/min (IP-based)`);
  console.log(`  - Auth: 15 req/15min (email-based)`);
  console.log(`  - Authenticated: 300 req/min (user-based)`);
  console.log(`  - AI: 20 req/min (user-based)`);
  console.log(`  - Webhooks: 100 req/min (IP-based)`);
  await connectDB();

  notificationScheduler.start();
});

startReminderCron();

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  notificationScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  notificationScheduler.stop();
  process.exit(0);
});

export default app;
