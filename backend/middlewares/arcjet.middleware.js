import aj from "../config/arcjet.js";

// This middleware is used to protect your app from common attacks e.g. SQL injection
// It is recommended to use this middleware in all routes
export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res
          .status(429)
          .json({ success: false, message: "Too many requests" });
      if (decision.reason === "DETECT_BOT")
        return res
          .status(403)
          .json({ success: false, message: "Bot detected" });
      return res
        .status(403)
        .json({ success: false, message: "Request denied" });
    }
    next();
  } catch (error) {
    console.log(`Arcjet error: ${error.message}`);
    next(error);
  }
};
export default arcjetMiddleware;
