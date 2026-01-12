import aj from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // We pass req.ip which Express now correctly populates
    // because of app.set("trust proxy", 1) in your server file.
    const decision = await aj.protect(req, {
      requested: 1,
      ip: req.ip,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res
          .status(429)
          .json({ success: false, message: "Too many requests" });

      // Note: Arcjet uses decision.reason.isBot() for bot detection checks
      if (decision.reason.isBot())
        return res
          .status(423) // Standard code for "Locked" or 403
          .json({ success: false, message: "Bot detected" });

      return res
        .status(403)
        .json({ success: false, message: "Request denied" });
    }

    next();
  } catch (error) {
    console.log(`Arcjet error: ${error.message}`);
    // In production, we usually call next() to allow the request
    // through if the security tool itself fails (fail-open)
    next();
  }
};

export default arcjetMiddleware;
