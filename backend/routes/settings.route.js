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

settingsRouter.use(authMiddleware);

settingsRouter.get("/", getSettings);

settingsRouter.put("/profile", validateProfile, updateProfile);
settingsRouter.put("/preferences", validatePreferences, updatePreferences);
settingsRouter.put(
  "/notifications",
  validateNotifications,
  updateNotifications
);
settingsRouter.put("/billing", validateBilling, updateBilling);

settingsRouter.delete("/account", validateDeleteAccount, deleteAccount);
settingsRouter.post("/reset", resetSettings);

export default settingsRouter;
