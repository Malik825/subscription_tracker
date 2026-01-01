import express from "express";
import multer from "multer";
import {
  scanReceipt,
  createFromReceipt,
  chatWithAI,
  executeAIAction,
} from "../controllers/ai.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const aiRoutes = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// All routes require authentication
aiRoutes.use(authMiddleware);

// Receipt scanning
aiRoutes.post("/scan-receipt", upload.single("receipt"), scanReceipt);
aiRoutes.post("/create-from-receipt", createFromReceipt);

// AI Chat
aiRoutes.post("/chat", chatWithAI);
aiRoutes.post("/execute-action", executeAIAction);

export default aiRoutes;
