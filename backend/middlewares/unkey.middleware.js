import rateLimiters from "../config/unkey.js";

const getClientIp = (req) => {
  let ip = "127.0.0.1";

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : forwarded[0];
  } else if (req.headers["x-real-ip"]) {
    ip = req.headers["x-real-ip"];
  } else if (req.ip) {
    ip = req.ip.replace(/^::ffff:/, "");
  } else if (req.socket?.remoteAddress) {
    ip = req.socket.remoteAddress.replace(/^::ffff:/, "");
  }

  return ip;
};

const createRateLimitMiddleware = (limiter) => {
  return async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const identifier = req.user?.id || ip;

      const { success, limit, remaining, reset } = await limiter.limit(
        identifier
      );

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", new Date(reset).toISOString());

      if (!success) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        });
      }

      next();
    } catch (error) {
      console.error(`[Unkey] Error: ${error.message}`);
      next();
    }
  };
};

export const defaultRateLimit = createRateLimitMiddleware(rateLimiters.default);
export const authRateLimit = createRateLimitMiddleware(rateLimiters.auth);
export const authenticatedRateLimit = createRateLimitMiddleware(
  rateLimiters.authenticated
);
export const aiRateLimit = createRateLimitMiddleware(rateLimiters.ai);
export const webhookRateLimit = createRateLimitMiddleware(rateLimiters.webhook);

export default defaultRateLimit;
