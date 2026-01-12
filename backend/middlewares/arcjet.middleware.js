import aj from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Render passes the real client IP in the x-forwarded-for header.
    // We try req.ip first, then the header, then a fallback.
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : req.ip || req.socket.remoteAddress || "127.0.0.1";

    const decision = await aj.protect(req, {
      requested: 1,
      ip: ip, // Pass the manually verified IP
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res
          .status(429)
          .json({ success: false, message: "Too many requests" });

      if (decision.reason.isBot())
        return res
          .status(423)
          .json({ success: false, message: "Bot detected" });

      return res
        .status(403)
        .json({ success: false, message: "Request denied" });
    }

    next();
  } catch (error) {
    console.log(`Arcjet error: ${error.message}`);
    next();
  }
};

export default arcjetMiddleware;
