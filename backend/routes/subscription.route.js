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

// ✅ FIXED: Get current user's subscriptions (not all users)
subscriptionRouter.get("/", authMiddleware, (req, res, next) => {
  // Automatically inject the authenticated user's ID
  req.params.id = req.user._id.toString();
  return getUserSubscriptions(req, res, next);
});

// ✅ NEW: Admin-only endpoint for getting all subscriptions
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

// Seed subscriptions (for current user)
subscriptionRouter.post("/seed", authMiddleware, seedSubscriptions);

// Get stats (for current user)
subscriptionRouter.get("/stats", authMiddleware, getSubscriptionStats);

// Get specific user's subscriptions (with authorization check)
subscriptionRouter.get("/user/:id", authMiddleware, getUserSubscriptions);

// Single subscription operations
subscriptionRouter.get("/:id", authMiddleware, getSubscription);
subscriptionRouter.patch("/:id", authMiddleware, updateSubscription);
subscriptionRouter.delete("/:id", authMiddleware, deleteSubscription);

// Subscription actions
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

// Bulk operations (only affect current user's subscriptions)
subscriptionRouter.delete("/bulk", authMiddleware, bulkDeleteSubscriptions);
subscriptionRouter.patch("/bulk/status", authMiddleware, bulkUpdateStatus);

export default subscriptionRouter;
