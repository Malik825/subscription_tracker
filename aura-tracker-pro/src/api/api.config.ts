// src/config/api.config.ts

/**
 * API Configuration
 * Centralizes polling intervals and API behavior
 */

export const API_CONFIG = {
  /**
   * Polling intervals for different API endpoints (in milliseconds)
   * Set to 0 to disable polling for that endpoint
   */
  POLLING_INTERVALS: {
    // Notifications - check every minute
    NOTIFICATIONS: 60000, // 1 minute (was 30 seconds)
    UNREAD_COUNT: 60000, // 1 minute (was 30 seconds)

    // Settings - rarely changes, no polling needed
    SETTINGS: 0, // No polling

    // User preferences - rarely changes
    USER_PREFERENCES: 0, // No polling

    // Subscriptions - moderate polling
    SUBSCRIPTIONS: 120000, // 2 minutes
  },

  /**
   * Cache durations (in seconds)
   * How long to keep unused data in cache
   */
  CACHE_DURATIONS: {
    NOTIFICATIONS: 120, // 2 minutes
    SETTINGS: 300, // 5 minutes
    USER_PREFERENCES: 300, // 5 minutes
    SUBSCRIPTIONS: 180, // 3 minutes
  },

  /**
   * Feature flags for development
   */
  DEV_MODE: {
    // Disable polling in development to avoid rate limits during testing
    DISABLE_POLLING: import.meta.env.DEV,
    // Log API calls in development
    LOG_API_CALLS: import.meta.env.DEV,
  },
} as const;

/**
 * Helper function to get polling interval
 * Returns 0 if polling is disabled in dev mode
 */
export function getPollingInterval(
  endpoint: keyof typeof API_CONFIG.POLLING_INTERVALS
): number {
  if (API_CONFIG.DEV_MODE.DISABLE_POLLING) {
    return 0;
  }
  return API_CONFIG.POLLING_INTERVALS[endpoint];
}

/**
 * Helper function to log API calls in development
 */
export function logApiCall(endpoint: string, method: string = "GET") {
  if (API_CONFIG.DEV_MODE.LOG_API_CALLS) {
    console.log(`[API] ${method} ${endpoint}`, new Date().toISOString());
  }
}
