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
    console.warn("⚠️  STRIPE_SECRET_KEY is missing. Stripe integration will be disabled.");
}

/**
 * STRIPE: Create Checkout Session
 */
export const createStripeSession = async (req, res, next) => {
    try {
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
            });
        }
        const { _id, email } = req.user;

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

        res.status(200).json({
            success: true,
            data: {
                checkoutUrl: session.url,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * STRIPE: Handle Webhook
 */
export const handleStripeWebhook = async (req, res, next) => {
    if (!stripe) {
        return res.status(500).send("Stripe is not configured.");
    }
    let event;

    try {
        const sig = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                const userId = session.metadata.userId;
                await User.findByIdAndUpdate(userId, { plan: "pro" });
                console.log(`✅ User ${userId} upgraded to Pro via Stripe`);
                break;

            case "customer.subscription.deleted":
                const deletedSubscription = event.data.object;
                // You'll need to store Stripe customer ID in your User model to handle this
                // For now, log it
                console.log(`⚠️  Subscription deleted:`, deletedSubscription.id);
                break;

            case "customer.subscription.updated":
                const updatedSubscription = event.data.object;
                // Handle subscription status changes
                if (
                    updatedSubscription.status === "canceled" ||
                    updatedSubscription.status === "unpaid"
                ) {
                    // Downgrade user logic here
                    console.log(
                        `⚠️  Subscription status changed:`,
                        updatedSubscription.status
                    );
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        next(error);
    }
};

/**
 * PAYSTACK: Initialize Transaction
 */
export const initializePaystackTransaction = async (req, res, next) => {
    try {
        const { _id, email } = req.user;

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

        res.status(200).json({
            success: true,
            data: {
                checkoutUrl: response.data.data.authorization_url,
                reference: response.data.data.reference,
            },
        });
    } catch (error) {
        console.error(
            "Paystack initialization error:",
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
        const crypto = await import("crypto");
        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(req.rawBody)
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            console.error("Invalid Paystack webhook signature");
            return res
                .status(401)
                .json({ success: false, message: "Invalid signature" });
        }

        const { event, data } = req.body;

        switch (event) {
            case "subscription.create":
            case "charge.success":
                const userId = data.metadata?.userId;
                if (userId) {
                    await User.findByIdAndUpdate(userId, { plan: "pro" });
                    console.log(`✅ User ${userId} upgraded to Pro via Paystack`);
                }
                break;

            case "subscription.disable":
                // Handle subscription cancellation
                const cancelledUserId = data.metadata?.userId;
                if (cancelledUserId) {
                    await User.findByIdAndUpdate(cancelledUserId, { plan: "free" });
                    console.log(`⚠️  User ${cancelledUserId} downgraded to Free`);
                }
                break;

            default:
                console.log(`Unhandled Paystack event: ${event}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Paystack webhook processing error:", error);
        next(error);
    }
};
