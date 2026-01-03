import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { PORT, NODE_ENV, FRONTEND_URL } from "./config/env.js";
import connectDB from "./database/mongodb.js";

import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import workflowRouter from "./routes/workflow.route.js";
import paymentRouter from "./routes/payment.route.js";
import aiRoutes from "./routes/ai.route.js";
import notificationRouter from "./routes/notifications.route.js";

import { startReminderCron } from "./utils/check-reminders.cron.js";
import notificationScheduler from "./utils/notificationScheduler.js"; // ← NEW: Import notification scheduler
import settingsRouter from "./routes/settings.route.js";

const app = express();

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const allowedOrigins = [
  "https://subscription-tracker-lovat.vercel.app",
  "http://localhost:5173",
  FRONTEND_URL,
].filter(Boolean);

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

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflow", workflowRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/settings", settingsRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();

  // ← NEW: Start notification scheduler after DB connection
  notificationScheduler.start();
});

// Keep your existing cron (you may want to migrate this logic to the new scheduler later)
startReminderCron();

// ← NEW: Graceful shutdown
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
