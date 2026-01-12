import { Ratelimit } from "@unkey/ratelimit";
import { UNKEY_ROOT_KEY } from "./env.js";

export const defaultRateLimiter = new Ratelimit({
  rootKey: UNKEY_ROOT_KEY,
  namespace: "api-default",
  limit: 60,
  duration: "60s",
  async: true,
});

export const authRateLimiter = new Ratelimit({
  rootKey: UNKEY_ROOT_KEY,
  namespace: "api-auth",
  limit: 5,
  duration: "60s",
  async: true,
});

export const authenticatedRateLimiter = new Ratelimit({
  rootKey: UNKEY_ROOT_KEY,
  namespace: "api-authenticated",
  limit: 120,
  duration: "60s",
  async: true,
});

export const aiRateLimiter = new Ratelimit({
  rootKey: UNKEY_ROOT_KEY,
  namespace: "api-ai",
  limit: 10,
  duration: "60s",
  async: true,
});

export const webhookRateLimiter = new Ratelimit({
  rootKey: UNKEY_ROOT_KEY,
  namespace: "api-webhook",
  limit: 100,
  duration: "60s",
  async: true,
});

export default {
  default: defaultRateLimiter,
  auth: authRateLimiter,
  authenticated: authenticatedRateLimiter,
  ai: aiRateLimiter,
  webhook: webhookRateLimiter,
};
