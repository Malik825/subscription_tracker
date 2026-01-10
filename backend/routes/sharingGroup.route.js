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
} from "../controllers/sharingGroup.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const sharingGroupRoutes = express.Router();

sharingGroupRoutes.use(authMiddleware);

sharingGroupRoutes.post("/", createSharingGroup);
sharingGroupRoutes.get("/", getUserSharingGroups);
sharingGroupRoutes.get("/:id", getSharingGroupById);
sharingGroupRoutes.put("/:id", updateSharingGroup);
sharingGroupRoutes.delete("/:id", deleteSharingGroup);

sharingGroupRoutes.post("/:id/members", addMember);
sharingGroupRoutes.delete("/:id/members/:memberId", removeMember);

sharingGroupRoutes.post("/:id/subscriptions", addSubscriptionToGroup);
sharingGroupRoutes.delete(
  "/:id/subscriptions/:subscriptionId",
  removeSubscriptionFromGroup
);
sharingGroupRoutes.put(
  "/:id/subscriptions/:subscriptionId/split",
  updateSplitConfiguration
);

export default sharingGroupRoutes;
