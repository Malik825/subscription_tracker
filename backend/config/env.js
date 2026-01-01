import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_ENV,
  ARCJET_KEY,
  QSTASH_URL,
  QSTASH_TOKEN,
  SERVER_URL,

  FRONTEND_URL, // Add this
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PRO_PRICE_ID,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_PLAN_CODE,
  SENDGRID_API_KEY,
} = process.env;
