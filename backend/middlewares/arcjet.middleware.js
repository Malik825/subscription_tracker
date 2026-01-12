import aj from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    // Extract IP with better fallback logic
    let ip = "127.0.0.1"; // Default fallback

    // Check x-forwarded-for header (Render/Vercel use this)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      ip =
        typeof forwarded === "string"
          ? forwarded.split(",")[0].trim()
          : forwarded[0];
    }
    // Check x-real-ip header (some proxies use this)
    else if (req.headers["x-real-ip"]) {
      ip = req.headers["x-real-ip"];
    }
    // Fall back to req.ip (Express provides this when trust proxy is set)
    else if (req.ip) {
      // Remove ::ffff: prefix from IPv6-mapped IPv4 addresses
      ip = req.ip.replace(/^::ffff:/, "");
    }
    // Last resort: socket address
    else if (req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress.replace(/^::ffff:/, "");
    }

    console.log(`[Arcjet] Processing request from IP: ${ip}`);

    const decision = await aj.protect(req, {
      requested: 1,
      ip: ip,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ success: false, message: "Too many requests" });
      }

      if (decision.reason.isBot()) {
        return res
          .status(423)
          .json({ success: false, message: "Bot detected" });
      }

      return res
        .status(403)
        .json({ success: false, message: "Request denied" });
    }

    next();
  } catch (error) {
    console.error(`[Arcjet] Error: ${error.message}`);
    // Fail-open to avoid blocking users on security tool errors
    next();
  }
};

export default arcjetMiddleware;
