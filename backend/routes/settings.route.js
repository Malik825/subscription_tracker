import express from "express";
import {
  getSettings,
  updateProfile,
  updatePreferences,
  updateNotifications,
  updateBilling,
  deleteAccount,
  resetSettings,
} from "../controllers/settings.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateProfile,
  validatePreferences,
  validateNotifications,
  validateBilling,
  validateDeleteAccount,
} from "../middlewares/validateSettings.middleware.js";

const settingsRouter = express.Router();

// All routes require authentication
settingsRouter.use(authMiddleware);

// Get user settings
settingsRouter.get("/", getSettings);

// Update specific settings sections
settingsRouter.put("/profile", validateProfile, updateProfile);
settingsRouter.put("/preferences", validatePreferences, updatePreferences);
settingsRouter.put(
  "/notifications",
  validateNotifications,
  updateNotifications
);
settingsRouter.put("/billing", validateBilling, updateBilling);

// Account management
settingsRouter.delete("/account", validateDeleteAccount, deleteAccount);
settingsRouter.post("/reset", resetSettings);

export default settingsRouter;
