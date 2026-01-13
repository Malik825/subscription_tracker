import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscriptionStatus,
  retriggerWorkflow,
  cancelWorkflowEndpoint,
  getWorkflowStatus,
  getSubscriptionStats,
  bulkDeleteSubscriptions,
  bulkUpdateStatus,
  seedSubscriptions,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// ============================================
// IMPORTANT: Specific routes MUST come before dynamic routes (/:id)
// ============================================

// ✅ Get current user's subscriptions (not all users)
subscriptionRouter.get("/", authMiddleware, (req, res, next) => {
  // Automatically inject the authenticated user's ID
  req.params.id = req.user._id.toString();
  return getUserSubscriptions(req, res, next);
});

// ✅ Admin-only endpoint for getting all subscriptions
subscriptionRouter.get("/all", authMiddleware, (req, res, next) => {
  // Only admins can access this
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
  return getAllSubscriptions(req, res, next);
});

// Create subscription
subscriptionRouter.post("/", authMiddleware, createSubscription);

// Seed subscriptions (for current user) - MUST come before /:id
subscriptionRouter.post("/seed", authMiddleware, seedSubscriptions);

// Get stats (for current user) - MUST come before /:id
subscriptionRouter.get("/stats", authMiddleware, getSubscriptionStats);

// Get specific user's subscriptions - MUST come before /:id
subscriptionRouter.get("/user/:id", authMiddleware, getUserSubscriptions);

// Bulk operations - MUST come before /:id routes
subscriptionRouter.delete("/bulk", authMiddleware, bulkDeleteSubscriptions);
subscriptionRouter.patch("/bulk/status", authMiddleware, bulkUpdateStatus);

// ============================================
// Dynamic routes (/:id) - These MUST come last!
// ============================================

// Single subscription operations
subscriptionRouter.get("/:id", authMiddleware, getSubscription);
subscriptionRouter.patch("/:id", authMiddleware, updateSubscription);
subscriptionRouter.put("/:id", authMiddleware, updateSubscription); // ✅ Added PUT support
subscriptionRouter.delete("/:id", authMiddleware, deleteSubscription);

// Subscription actions with /:id
subscriptionRouter.patch(
  "/:id/toggle-status",
  authMiddleware,
  toggleSubscriptionStatus
);

subscriptionRouter.get(
  "/:id/workflow-status",
  authMiddleware,
  getWorkflowStatus
);

subscriptionRouter.post(
  "/:id/workflow-retrigger",
  authMiddleware,
  retriggerWorkflow
);

subscriptionRouter.post(
  "/:id/workflow-cancel",
  authMiddleware,
  cancelWorkflowEndpoint
);

export default subscriptionRouter;
