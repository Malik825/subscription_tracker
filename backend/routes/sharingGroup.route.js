import express from "express";
import {
  createSharingGroup,
  getUserSharingGroups,
  getSharingGroupById,
  updateSharingGroup,
  deleteSharingGroup,
  addMember,
  removeMember,
  addSubscriptionToGroup,
  removeSubscriptionFromGroup,
  updateSplitConfiguration,
  // NEW: Import invitation controllers
  getUserInvitations,
  declineInvitation,
  cancelInvitation,
  acceptInvitation,
} from "../controllers/sharingGroup.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import requirePro from "../middlewares/requirePro.middleware.js";

const sharingGroupRoutes = express.Router();

// Apply auth middleware to all routes
sharingGroupRoutes.use(authMiddleware);

// Apply Pro middleware to all sharing routes (Family Sharing is Pro-only)
sharingGroupRoutes.use(requirePro);

// ========== INVITATION ROUTES (Must come BEFORE :id routes) ==========
// Get user's pending invitations
sharingGroupRoutes.get("/invitations", getUserInvitations);

// Accept an invitation
sharingGroupRoutes.post("/invitations/:groupId/accept", acceptInvitation);

// Decline an invitation
sharingGroupRoutes.post("/invitations/:groupId/decline", declineInvitation);

// ========== GROUP ROUTES ==========
// Create a new sharing group
sharingGroupRoutes.post("/", createSharingGroup);

// Get all user's sharing groups
sharingGroupRoutes.get("/", getUserSharingGroups);

// Get sharing group by ID
sharingGroupRoutes.get("/:id", getSharingGroupById);

// Update sharing group
sharingGroupRoutes.put("/:id", updateSharingGroup);

// Delete sharing group
sharingGroupRoutes.delete("/:id", deleteSharingGroup);

// ========== MEMBER ROUTES ==========
// Add member (send invitation)
sharingGroupRoutes.post("/:id/members", addMember);

// Remove member
sharingGroupRoutes.delete("/:id/members/:memberId", removeMember);

// ========== INVITATION MANAGEMENT ROUTES (by admin) ==========
// Cancel an invitation (by group admin/owner)
sharingGroupRoutes.delete(
  "/:groupId/invitations/:invitationId",
  cancelInvitation
);

// ========== SUBSCRIPTION ROUTES ==========
// Add subscription to group
sharingGroupRoutes.post("/:id/subscriptions", addSubscriptionToGroup);

// Remove subscription from group
sharingGroupRoutes.delete(
  "/:id/subscriptions/:subscriptionId",
  removeSubscriptionFromGroup
);

// Update split configuration
sharingGroupRoutes.put(
  "/:id/subscriptions/:subscriptionId/split",
  updateSplitConfiguration
);

export default sharingGroupRoutes;
