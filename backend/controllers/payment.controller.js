import Stripe from "stripe";
import axios from "axios";
import User from "../models/user.model.js";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRO_PRICE_ID,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_PLAN_CODE,
  FRONTEND_URL,
} from "../config/env.js";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

if (!STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY is missing. Stripe integration will be disabled."
  );
}

/**
 * STRIPE: Create Checkout Session
 */
export const createStripeSession = async (req, res, next) => {
  try {
    console.log("🔵 [STRIPE] Creating checkout session...");

    if (!stripe) {
      console.error("❌ [STRIPE] Stripe not configured");
      return res.status(500).json({
        success: false,
        message:
          "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
      });
    }

    const { _id, email } = req.user;
    console.log("🔵 [STRIPE] User:", { userId: _id.toString(), email });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${FRONTEND_URL}/dashboard?payment=success&gateway=stripe`,
      cancel_url: `${FRONTEND_URL}/dashboard?payment=cancelled`,
      customer_email: email,
      metadata: {
        userId: _id.toString(),
      },
    });

    console.log("✅ [STRIPE] Checkout session created:", {
      sessionId: session.id,
      url: session.url,
      userId: _id.toString(),
    });

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error(
      "❌ [STRIPE] Error creating checkout session:",
      error.message
    );
    next(error);
  }
};

/**
 * STRIPE: Handle Webhook
 */
export const handleStripeWebhook = async (req, res, next) => {
  console.log("🟣 [STRIPE WEBHOOK] Received webhook");

  if (!stripe) {
    console.error("❌ [STRIPE WEBHOOK] Stripe not configured");
    return res.status(500).send("Stripe is not configured.");
  }

  let event;

  try {
    const sig = req.headers["stripe-signature"];
    console.log("🟣 [STRIPE WEBHOOK] Signature present:", !!sig);

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    console.log(
      "✅ [STRIPE WEBHOOK] Signature verified. Event type:",
      event.type
    );
  } catch (err) {
    console.error(
      "❌ [STRIPE WEBHOOK] Signature verification failed:",
      err.message
    );
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("🟣 [STRIPE WEBHOOK] Processing event:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const userId = session.metadata.userId;

        console.log("🟣 [STRIPE WEBHOOK] Checkout completed:", {
          sessionId: session.id,
          userId,
          customerEmail: session.customer_email,
          paymentStatus: session.payment_status,
        });

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { plan: "pro" },
          { new: true }
        );

        if (updatedUser) {
          console.log("✅ [STRIPE WEBHOOK] User upgraded to Pro:", {
            userId,
            email: updatedUser.email,
            plan: updatedUser.plan,
          });
        } else {
          console.error("❌ [STRIPE WEBHOOK] User not found:", userId);
        }
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        console.log("⚠️ [STRIPE WEBHOOK] Subscription deleted:", {
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer,
        });
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        console.log("⚠️ [STRIPE WEBHOOK] Subscription updated:", {
          subscriptionId: updatedSubscription.id,
          status: updatedSubscription.status,
        });

        if (
          updatedSubscription.status === "canceled" ||
          updatedSubscription.status === "unpaid"
        ) {
          console.log(
            "⚠️ [STRIPE WEBHOOK] Subscription status needs attention:",
            updatedSubscription.status
          );
        }
        break;

      default:
        console.log("🟣 [STRIPE WEBHOOK] Unhandled event type:", event.type);
    }

    console.log("✅ [STRIPE WEBHOOK] Event processed successfully");
    res.json({ received: true });
  } catch (error) {
    console.error("❌ [STRIPE WEBHOOK] Processing error:", error);
    next(error);
  }
};

/**
 * PAYSTACK: Initialize Transaction
 */
export const initializePaystackTransaction = async (req, res, next) => {
  try {
    console.log("🟢 [PAYSTACK] Initializing transaction...");

    const { _id, email } = req.user;
    console.log("🟢 [PAYSTACK] User:", { userId: _id.toString(), email });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email,
        amount: "150000", // 1500.00 in kobo (for NGN) or pesewas (for GHS)
        plan: PAYSTACK_PLAN_CODE,
        callback_url: `${FRONTEND_URL}/dashboard?payment=success&gateway=paystack`,
        metadata: {
          userId: _id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ [PAYSTACK] Transaction initialized:", {
      reference: response.data.data.reference,
      authUrl: response.data.data.authorization_url,
      userId: _id.toString(),
    });

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
      },
    });
  } catch (error) {
    console.error(
      "❌ [PAYSTACK] Initialization error:",
      error.response?.data || error.message
    );
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message:
          error.response.data.message || "Paystack initialization failed",
      });
    }
    next(error);
  }
};

/**
 * PAYSTACK: Handle Webhook
 */
export const handlePaystackWebhook = async (req, res, next) => {
  try {
    console.log("🟢 [PAYSTACK WEBHOOK] Received webhook");

    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    const paystackSignature = req.headers["x-paystack-signature"];
    console.log(
      "🟢 [PAYSTACK WEBHOOK] Signature present:",
      !!paystackSignature
    );

    if (hash !== paystackSignature) {
      console.error("❌ [PAYSTACK WEBHOOK] Invalid signature");
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature" });
    }

    console.log("✅ [PAYSTACK WEBHOOK] Signature verified");

    // Parse the JSON manually since we received raw buffer
    const payload = JSON.parse(req.body.toString());
    const { event, data } = payload;

    console.log("🟢 [PAYSTACK WEBHOOK] Event type:", event);
    console.log("🟢 [PAYSTACK WEBHOOK] Event data:", {
      reference: data.reference,
      amount: data.amount,
      status: data.status,
      userId: data.metadata?.userId,
    });

    switch (event) {
      case "subscription.create":
      case "charge.success":
        const userId = data.metadata?.userId;
        console.log(
          "🟢 [PAYSTACK WEBHOOK] Processing payment success for user:",
          userId
        );

        if (userId) {
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { plan: "pro" },
            { new: true }
          );

          if (updatedUser) {
            console.log("✅ [PAYSTACK WEBHOOK] User upgraded to Pro:", {
              userId,
              email: updatedUser.email,
              plan: updatedUser.plan,
            });
          } else {
            console.error("❌ [PAYSTACK WEBHOOK] User not found:", userId);
          }
        } else {
          console.error("❌ [PAYSTACK WEBHOOK] No userId in metadata");
        }
        break;

      case "subscription.disable":
        const cancelledUserId = data.metadata?.userId;
        console.log(
          "⚠️ [PAYSTACK WEBHOOK] Processing subscription cancellation for user:",
          cancelledUserId
        );

        if (cancelledUserId) {
          const downgradedUser = await User.findByIdAndUpdate(
            cancelledUserId,
            { plan: "free" },
            { new: true }
          );

          if (downgradedUser) {
            console.log("✅ [PAYSTACK WEBHOOK] User downgraded to Free:", {
              userId: cancelledUserId,
              email: downgradedUser.email,
              plan: downgradedUser.plan,
            });
          }
        }
        break;

      default:
        console.log("🟢 [PAYSTACK WEBHOOK] Unhandled event type:", event);
    }

    console.log("✅ [PAYSTACK WEBHOOK] Event processed successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ [PAYSTACK WEBHOOK] Processing error:", error);
    next(error);
  }
};
