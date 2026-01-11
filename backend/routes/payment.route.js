import { Router } from "express";
import {
  createStripeSession,
  handleStripeWebhook,
  initializePaystackTransaction,
  handlePaystackWebhook,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

// STRIPE
paymentRouter.post("/stripe/checkout", authMiddleware, createStripeSession);
paymentRouter.post("/stripe/webhook", handleStripeWebhook);

// PAYSTACK
paymentRouter.post(
  "/paystack/initialize",
  authMiddleware,
  initializePaystackTransaction
);
paymentRouter.post("/paystack/webhook", handlePaystackWebhook);

export default paymentRouter;
