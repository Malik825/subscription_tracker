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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

aiRoutes.use(authMiddleware);

aiRoutes.post("/scan-receipt", upload.single("receipt"), scanReceipt);
aiRoutes.post("/create-from-receipt", createFromReceipt);

aiRoutes.post("/chat", chatWithAI);
aiRoutes.post("/execute-action", executeAIAction);

export default aiRoutes;
