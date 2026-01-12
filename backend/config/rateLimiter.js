// backend/config/rateLimiter.js
import rateLimit from "express-rate-limit";

// Helper function to get the appropriate identifier
const getKeyGenerator = (type) => {
  return (req) => {
    switch (type) {
      case "auth":
        // For auth routes: use email if available, otherwise IP
        return req.body?.email || getClientIp(req);

      case "authenticated":
        // For authenticated routes: use user ID
        return req.user?.id ? `user:${req.user.id}` : getClientIp(req);

      case "session":
        // For session checks: use user ID with fallback
        return req.user?.id ? `user:${req.user.id}` : getClientIp(req);

      default:
        // Default: use IP
        return getClientIp(req);
    }
  };
};

// Helper to extract client IP
const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : forwarded[0];
  }
  return (
    req.headers["x-real-ip"] ||
    req.ip?.replace(/^::ffff:/, "") ||
    req.socket?.remoteAddress?.replace(/^::ffff:/, "") ||
    "127.0.0.1"
  );
};

// Standardized error handler
const handler = (req, res) => {
  const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);

  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
    retryAfter,
    limit: req.rateLimit.limit,
    remaining: 0,
  });
};

// Standard headers
const standardHeaders = true;
const legacyHeaders = false;

// 1. Default Rate Limiter (General API routes)
export const defaultRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests from this IP, please try again later.",
  standardHeaders,
  legacyHeaders,
  keyGenerator: getKeyGenerator("default"),
  handler,
});

// 2. Auth Rate Limiter (Login, Register, Password Reset)
// Uses EMAIL as identifier to prevent IP-sharing issues
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per 15 minutes per email
  message: "Too many authentication attempts. Please try again later.",
  standardHeaders,
  legacyHeaders,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
  keyGenerator: getKeyGenerator("auth"),
  handler,
});

// 3. Authenticated Rate Limiter (Routes requiring login)
// Uses USER ID as identifier
export const authenticatedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute per user
  message: "You are making requests too quickly. Please slow down.",
  standardHeaders,
  legacyHeaders,
  keyGenerator: getKeyGenerator("authenticated"),
  handler,
});

// 4. Session Rate Limiter (getCurrentUser, token validation)
// Very generous - used for frequent session checks
export const sessionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute per user
  message: "Too many session validation requests.",
  standardHeaders,
  legacyHeaders,
  skipSuccessfulRequests: true,
  keyGenerator: getKeyGenerator("session"),
  handler,
});

// 5. AI Rate Limiter (Expensive AI operations)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: "Too many AI requests. Please wait before trying again.",
  standardHeaders,
  legacyHeaders,
  keyGenerator: getKeyGenerator("authenticated"),
  handler,
});

// 6. Webhook Rate Limiter
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Webhook rate limit exceeded.",
  standardHeaders,
  legacyHeaders,
  keyGenerator: getKeyGenerator("default"),
  handler,
});

// 7. Email Sending Rate Limiter (Prevent email spam)
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails per hour per email address
  message: "Too many email requests. Please try again later.",
  standardHeaders,
  legacyHeaders,
  keyGenerator: getKeyGenerator("auth"),
  handler,
});

export default {
  default: defaultRateLimiter,
  auth: authRateLimiter,
  authenticated: authenticatedRateLimiter,
  session: sessionRateLimiter,
  ai: aiRateLimiter,
  webhook: webhookRateLimiter,
  email: emailRateLimiter,
};
