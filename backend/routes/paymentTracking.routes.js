import express from "express";
import {
  createPaymentRecord,
  getGroupPayments,
  getUserPayments,
  markPaymentAsPaid,
  updatePaymentStatus,
  sendPaymentReminder,
  getPaymentSummary,
  deletePaymentRecord,
  checkOverduePayments,
} from "../controllers/paymentTracking.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const paymentTrackingRoutes = express.Router();

paymentTrackingRoutes.use(authMiddleware);

paymentTrackingRoutes.post("/", createPaymentRecord);
paymentTrackingRoutes.get("/user", getUserPayments);
paymentTrackingRoutes.get("/group/:groupId", getGroupPayments);
paymentTrackingRoutes.get("/group/:groupId/summary", getPaymentSummary);
paymentTrackingRoutes.put("/:id/mark-paid", markPaymentAsPaid);
paymentTrackingRoutes.put("/:id/status", updatePaymentStatus);
paymentTrackingRoutes.post("/:id/remind", sendPaymentReminder);
paymentTrackingRoutes.delete("/:id", deletePaymentRecord);
paymentTrackingRoutes.post("/check-overdue", checkOverduePayments);

export default paymentTrackingRoutes;
