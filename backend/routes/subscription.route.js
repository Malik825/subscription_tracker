import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  // CRUD Operations
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,

  // Status Management
  toggleSubscriptionStatus,

  // Workflow Management
  retriggerWorkflow,
  cancelWorkflow,
  getWorkflowStatus,

  // Statistics & Analytics
  getSubscriptionStats,

  // Bulk Operations
  bulkDeleteSubscriptions,
  bulkUpdateStatus,
  seedSubscriptions,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

// ============================================================================
// CRUD Routes
// ============================================================================

// Get all subscriptions (with filters & pagination)
subscriptionRouter.get("/", authMiddleware, getAllSubscriptions);

// Create new subscription
subscriptionRouter.post("/", authMiddleware, createSubscription);

// Seed subscriptions
subscriptionRouter.post("/seed", authMiddleware, seedSubscriptions);

// Get user statistics
subscriptionRouter.get("/stats", authMiddleware, getSubscriptionStats);

// Get user's subscriptions
subscriptionRouter.get("/user/:id", authMiddleware, getUserSubscriptions);

// Get single subscription
subscriptionRouter.get("/:id", authMiddleware, getSubscription);

// Update subscription
subscriptionRouter.patch("/:id", authMiddleware, updateSubscription);

// Delete subscription
subscriptionRouter.delete("/:id", authMiddleware, deleteSubscription);

// ============================================================================
// Status Management Routes
// ============================================================================

// Toggle subscription status (Active/Inactive)
subscriptionRouter.patch(
  "/:id/toggle-status",
  authMiddleware,
  toggleSubscriptionStatus
);

// ============================================================================
// Workflow Management Routes
// ============================================================================

// Get workflow status
subscriptionRouter.get(
  "/:id/workflow-status",
  authMiddleware,
  getWorkflowStatus
);

// Retrigger workflow
subscriptionRouter.post(
  "/:id/workflow-retrigger",
  authMiddleware,
  retriggerWorkflow
);

// Cancel workflow
subscriptionRouter.post("/:id/workflow-cancel", authMiddleware, cancelWorkflow);

// ============================================================================
// Statistics & Analytics Routes
// ============================================================================

// Get subscription statistics
subscriptionRouter.get("/:id/stats", authMiddleware, getSubscriptionStats);

// ============================================================================
// Bulk Operations Routes
// ============================================================================

// Bulk delete subscriptions
subscriptionRouter.delete("/bulk", authMiddleware, bulkDeleteSubscriptions);

// Bulk update subscription status
subscriptionRouter.patch("/bulk/status", authMiddleware, bulkUpdateStatus);

export default subscriptionRouter;
