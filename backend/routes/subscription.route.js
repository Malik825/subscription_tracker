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

subscriptionRouter.get("/", authMiddleware, getAllSubscriptions);
subscriptionRouter.post("/", authMiddleware, createSubscription);
subscriptionRouter.post("/seed", authMiddleware, seedSubscriptions);
subscriptionRouter.get("/stats", authMiddleware, getSubscriptionStats);
subscriptionRouter.get("/user/:id", authMiddleware, getUserSubscriptions);
subscriptionRouter.get("/:id", authMiddleware, getSubscription);
subscriptionRouter.patch("/:id", authMiddleware, updateSubscription);
subscriptionRouter.delete("/:id", authMiddleware, deleteSubscription);

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

subscriptionRouter.delete("/bulk", authMiddleware, bulkDeleteSubscriptions);
subscriptionRouter.patch("/bulk/status", authMiddleware, bulkUpdateStatus);

export default subscriptionRouter;
