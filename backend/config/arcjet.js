import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    
    // Create a bot detection rule
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment if needed:
        // "CATEGORY:MONITOR",       // Uptime monitoring services
        // "CATEGORY:PREVIEW",       // Link previews e.g. Slack, Discord
      ],
    }),
    
    // ✅ UPDATED: More generous token bucket rate limit
    tokenBucket({
      mode: "LIVE",
      refillRate: 100,   // ✅ Refill 100 tokens per minute (was 5 per 10s)
      interval: 60,      // ✅ Refill every 60 seconds (was 10s)
      capacity: 150,     // ✅ Bucket capacity of 150 tokens (was 10)
    }),
  ],
});

export default aj;
